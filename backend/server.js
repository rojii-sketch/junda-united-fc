import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import jwt from 'jsonwebtoken';
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
import NodeCache from 'node-cache';
const apiCache = new NodeCache({ stdTTL: 600 }); // Data lives in memory for 10 minutes (600 seconds)
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

// 🛡️ THE MAGIC CACHE SHIELD
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=600');

    const key = req.originalUrl;
    const cachedData = apiCache.get(key);

    if (cachedData) {
      console.log(`⚡ FAST LOAD: Serving ${key} from Render Memory`);
      return res.json(JSON.parse(cachedData));
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        apiCache.set(key, JSON.stringify(body));
        console.log(`💾 DB READ: Saved ${key} to Render Memory`);
      }
      originalJson(body);
    };
    next();
  } else {
    if (req.originalUrl.includes('/api/')) {
       console.log('🧹 ADMIN UPDATE DETECTED: Wiping Cache to pull fresh data');
       apiCache.flushAll();
    }
    next();
  }
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 Connected smoothly to MongoDB Atlas Cloud Database'))
  .catch(err => console.error('❌ Database Connection Error:', err));

// Test Endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Junda United API is alive and kicking!" });
});


// ==========================================================
// 🔐 SECURE ADMIN LOGIN ENDPOINT
// ==========================================================
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'junda2026';

  console.log(`React sent -> User: "${username}" | Pass: "${password}"`);
  console.log(`Render expects -> User: "${ADMIN_USER}" | Pass: "${ADMIN_PASS}"`);

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { username: ADMIN_USER, role: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }
    );
    
    res.json({ success: true, token, message: "Authentication successful" });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// 🛡️ JWT VERIFICATION BOUNCER
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access Denied. No valid token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // Attach the VIP info to the request
    next(); // Let them through!
  } catch (err) {
    res.status(401).json({ error: 'Access Denied. Token is invalid or expired.' });
  }
};


// ==========================================================
// 📰 NEWS ENDPOINTS
// ==========================================================
app.get('/api/news', async (req, res) => {
  try { res.json(await News.find().sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/news', requireAuth, async (req, res) => {
  try { res.status(201).json(await new News(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/news/:id', requireAuth, async (req, res) => {
  try { res.json(await News.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/news/:id', requireAuth, async (req, res) => {
  try { await News.findByIdAndDelete(req.params.id); res.json({ message: 'Article wiped clean' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================================
// ⚽ SQUAD ROSTER ENDPOINTS
// ==========================================================
app.get('/api/players', async (req, res) => {
  try { res.json(await Player.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/players', requireAuth, async (req, res) => {
  try { res.status(201).json(await new Player(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/players/:id', requireAuth, async (req, res) => {
  try { res.json(await Player.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/players/:id', requireAuth, async (req, res) => {
  try { await Player.findByIdAndDelete(req.params.id); res.json({ message: 'Player removed' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================================
// 📸 GALLERY ENDPOINTS
// ==========================================================
app.get('/api/gallery', async (req, res) => {
  try { res.json(await Gallery.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/gallery', requireAuth, async (req, res) => {
  try { res.status(201).json(await new Gallery(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/gallery/:id', requireAuth, async (req, res) => {
  try { await Gallery.findByIdAndDelete(req.params.id); res.json({ message: 'Asset removed' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================================
// 🗓️ FIXTURES & MATCH HUB ENDPOINTS
// ==========================================================
app.get('/api/fixtures', async (req, res) => {
  try { res.json(await Fixture.find().sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/fixtures', requireAuth, async (req, res) => {
  try { res.status(201).json(await new Fixture(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/fixtures/:id', requireAuth, async (req, res) => {
  try { await Fixture.findByIdAndDelete(req.params.id); res.json({ message: 'Fixture removed' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================================
// 📊 LEAGUE STANDINGS ENDPOINTS
// ==========================================================
app.get('/api/standings', async (req, res) => {
  try { res.json(await Standing.find().sort({ rank: 1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/standings', requireAuth, async (req, res) => {
  try {
    const query = { name: req.body.name };
    const update = req.body;
    const options = { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true };
    res.status(201).json(await Standing.findOneAndUpdate(query, update, options));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/standings/:id', requireAuth, async (req, res) => {
  try { await Standing.findByIdAndDelete(req.params.id); res.json({ message: 'Team removed' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================================
// 📸 CLOUDINARY IMAGE UPLOAD ENDPOINT
// ==========================================================
// Note: We also protect the upload route so randos can't upload to your Cloudinary!
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'junda_united', timeout: 120000 }, 
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true, url: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

// Boot listening port execution
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🛰️  Backend API Active on http://localhost:${PORT}`));