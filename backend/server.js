import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import express from 'express';
import mongoose from 'mongoose';
import Fixture from './models/Fixture.js'
import cors from 'cors';
import Standing from './models/Standing.js';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

// 📚 1. Import our database blueprints/models
import News from './models/News.js';
import Player from './models/Player.js';
import Gallery from './models/Gallery.js';

dotenv.config();
const app = express();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage engine (holds files temporarily in buffer memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json()); // Allows server to read JSON data bodies sent by React

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 Connected smoothly to MongoDB Atlas Cloud Database'))
  .catch(err => console.error('❌ Database Connection Error:', err));

// Test Endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Junda United API is alive and kicking!" });
});

// ==========================================================
// 📰 2. NEWS ENDPOINTS (Fetch, Create, Update, Delete)
// ==========================================================

// GET all posts (Newest first)
app.get('/api/news', async (req, res) => {
  try {
    const articles = await News.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new article
app.post('/api/news', async (req, res) => {
  try {
    const newArticle = new News(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (Update) an article
app.put('/api/news/:id', async (req, res) => {
  try {
    const updatedArticle = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an article
app.delete('/api/news/:id', async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article wiped clean from cloud storage' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// ⚽ 3. SQUAD ROSTER ENDPOINTS
// ==========================================================
app.get('/api/players', async (req, res) => {
  try { res.json(await Player.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/players', async (req, res) => {
  try { res.status(201).json(await new Player(req.body).save()); } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/players/:id', async (req, res) => {
  try { await Player.findByIdAndDelete(req.params.id); res.json({ message: 'Player removed' }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================================
// 📸 4. GALLERY ENDPOINTS
// ==========================================================
app.get('/api/gallery', async (req, res) => {
  try { res.json(await Gallery.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gallery', async (req, res) => {
  try { res.status(201).json(await new Gallery(req.body).save()); } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try { await Gallery.findByIdAndDelete(req.params.id); res.json({ message: 'Asset removed' }); } catch (err) { res.status(500).json({ error: err.message }); }
});
// ==========================================================
// 🗓️ FIXTURES & MATCH HUB ENDPOINTS
// ==========================================================
app.get('/api/fixtures', async (req, res) => {
  try {
    // Sort by date or creation order
    const matches = await Fixture.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fixtures', async (req, res) => {
  try {
    const newMatch = new Fixture(req.body);
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/fixtures/:id', async (req, res) => {
  try {
    await Fixture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fixture entry removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================================
// 📊 LEAGUE STANDINGS ENDPOINTS
// ==========================================================
app.get('/api/standings', async (req, res) => {
  try {
    // Sort by rank ascending (1st place at the top)
    const table = await Standing.find().sort({ rank: 1 });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/standings', async (req, res) => {
  try {
    // Check if team already exists to update it, or create a new entry
    const query = { name: req.body.name };
    const update = req.body;
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const savedTeam = await Standing.findOneAndUpdate(query, update, options);
    res.status(201).json(savedTeam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/standings/:id', async (req, res) => {
  try {
    await Standing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team removed from standings.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================================
// 🔐 5. SECURE ADMIN LOGIN ENDPOINT
// ==========================================================
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Look for the admin record in MongoDB
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check if the password matches the database record
    if (admin.password === password) {
      return res.json({ success: true, message: 'Access granted!' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================================
// 📸 CLOUDINARY IMAGE UPLOAD ENDPOINT (With Network Optimization)
// ==========================================================
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  // 🎯 OPTIMIZATION: Inject timeout configurations for slower connections
  const uploadStream = cloudinary.uploader.upload_stream(
    { 
      folder: 'junda_united',
      timeout: 120000, // 👈 Sets internal network timeout limit to 2 minutes
    }, 
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      
      // Send back the secure live URL link generated by Cloudinary
      res.json({ success: true, url: result.secure_url });
    }
  );

  // Stream the file buffer data up to Cloudinary
  uploadStream.end(req.file.buffer);
});
// Boot listening port execution
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🛰️  Backend API Active on http://localhost:${PORT}`));