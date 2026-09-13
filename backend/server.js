import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
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

const requiredAuthEnvironmentVariables = ['JWT_SECRET'];
const missingAuthEnvironmentVariables = requiredAuthEnvironmentVariables.filter(
  (name) => !process.env[name]?.trim()
);

if (missingAuthEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required authentication environment variable(s): ${missingAuthEnvironmentVariables.join(', ')}`
  );
}

const { JWT_SECRET } = process.env;
const app = express();
app.set('trust proxy', 1);

const productionFrontendOrigin = process.env.FRONTEND_ORIGIN || 'https://junda-united-fc.vercel.app';
const allowedOrigins = new Set([
  productionFrontendOrigin,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
]);

const loginKeyGenerator = (req) => ipKeyGenerator(req.ip);
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: loginKeyGenerator,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many login attempts. Try again later.'
  })
});

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many upload attempts. Try again later.'
  })
});

const mutationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many requests. Try again later.'
  })
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage engine (holds files temporarily in buffer memory)
const storage = multer.memoryStorage();
const allowedUploadTypes = new Map([
  ['image/jpeg', /\.(jpe?g)$/i],
  ['image/png', /\.png$/i],
  ['image/webp', /\.webp$/i],
  ['image/gif', /\.gif$/i]
]);
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const extensionPattern = allowedUploadTypes.get(file.mimetype);
    if (!extensionPattern || !extensionPattern.test(file.originalname)) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    }
    return callback(null, true);
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed'));
  }
}));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});
app.use(express.json({ limit: '100kb' })); // Allows server to read bounded JSON bodies from React

// 🛡️ THE MAGIC CACHE SHIELD
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    const key = req.originalUrl;
    const isFixtureListRequest = key === '/api/fixtures' || key.startsWith('/api/fixtures?');
    res.set('Cache-Control', isFixtureListRequest ? 'no-store' : 'public, max-age=600');

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

let databaseReady = false;
let initialConnectionSettled = false;
let startupFailed = false;

mongoose.connection.on('connected', () => {
  databaseReady = true;
  console.log('🚀 Connected smoothly to MongoDB Atlas Cloud Database');
});

mongoose.connection.on('disconnected', () => {
  databaseReady = false;
  if (initialConnectionSettled) {
    console.error('❌ MongoDB connection disconnected');
  }
});

mongoose.connection.on('reconnected', () => {
  databaseReady = true;
  console.log('🔄 MongoDB connection reconnected');
});

mongoose.connection.on('error', (error) => {
  if (initialConnectionSettled && !startupFailed) {
    console.error(`❌ MongoDB connection error: ${error.name || 'unknown error'}`);
  }
});

// Test Endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Junda United API is alive and kicking!" });
});

app.get('/api/ready', (req, res) => {
  if (!databaseReady || mongoose.connection.readyState !== 1) {
    return res.status(503).json({ ready: false });
  }

  return res.json({ ready: true });
});


// ==========================================================
// 🔐 SECURE ADMIN LOGIN ENDPOINT
// ==========================================================
app.post('/api/admin/login', loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    loginRateLimit.resetKey(loginKeyGenerator(req));
    return res.json({ success: true, token, message: "Authentication successful" });
  } catch (error) {
    console.error('Database/Authentication error during admin login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 🛡️ JWT VERIFICATION BOUNCER
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access Denied. No valid token provided.' });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ error: 'Access Denied. No valid token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (decoded.role !== 'admin' || typeof decoded.username !== 'string' || !decoded.username.trim()) {
      return res.status(403).json({ error: 'Access Denied. Insufficient privileges.' });
    }

    req.admin = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Access Denied. Token is invalid or expired.' });
  }
};


// ==========================================================
// 📰 NEWS ENDPOINTS
// ==========================================================
app.get('/api/news', async (req, res) => {
  try { res.json(await News.find().sort({ createdAt: -1 })); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/news', requireAuth, mutationRateLimit, async (req, res) => {
  try { res.status(201).json(await new News(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.put('/api/news/:id', requireAuth, mutationRateLimit, async (req, res) => {
  try {
    const allowedFields = ['title', 'content', 'imageUrl', 'date'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ error: 'Article not found' });
    }

    return res.json(updatedNews);
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.delete('/api/news/:id', requireAuth, mutationRateLimit, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);

    if (!deletedNews) {
      return res.status(404).json({ error: 'Article not found' });
    }

    return res.json({ message: 'Article wiped clean' });
  }
  catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================================
// ⚽ SQUAD ROSTER ENDPOINTS
// ==========================================================
app.get('/api/players', async (req, res) => {
  try { res.json(await Player.find()); } catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/players', requireAuth, mutationRateLimit, async (req, res) => {
  try { res.status(201).json(await new Player(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.put('/api/players/:id', requireAuth, mutationRateLimit, async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'position',
      'jerseyNumber',
      'role',
      'image',
      'age',
      'squadCategory',
      'appearances',
      'goals',
      'bio',
      'contact'
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    return res.json(updatedPlayer);
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }
});

app.delete('/api/players/:id', requireAuth, mutationRateLimit, async (req, res) => {
  try { await Player.findByIdAndDelete(req.params.id); res.json({ message: 'Player removed' }); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});


// ==========================================================
// 📸 GALLERY ENDPOINTS
// ==========================================================
app.get('/api/gallery', async (req, res) => {
  try { res.json(await Gallery.find()); } catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/gallery', requireAuth, mutationRateLimit, async (req, res) => {
  try { res.status(201).json(await new Gallery(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.delete('/api/gallery/:id', requireAuth, mutationRateLimit, async (req, res) => {
  try { await Gallery.findByIdAndDelete(req.params.id); res.json({ message: 'Asset removed' }); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});


// ==========================================================
// 🗓️ FIXTURES & MATCH HUB ENDPOINTS
// ==========================================================
app.get('/api/fixtures', async (req, res) => {
  try { res.json(await Fixture.find().sort({ createdAt: -1 })); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/fixtures', requireAuth, mutationRateLimit, async (req, res) => {
  try { res.status(201).json(await new Fixture(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.delete('/api/fixtures/:id', requireAuth, mutationRateLimit, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid fixture ID' });
  }

  try {
    const deletedFixture = await Fixture.findByIdAndDelete(req.params.id);

    if (!deletedFixture) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    return res.json({ message: 'Fixture removed' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================================
// 📊 LEAGUE STANDINGS ENDPOINTS
// ==========================================================
app.get('/api/standings', async (req, res) => {
  try { res.json(await Standing.find().sort({ rank: 1 })); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/standings', requireAuth, mutationRateLimit, async (req, res) => {
  try {
    const escapedName = req.body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = { name: { $regex: `^${escapedName}$`, $options: 'i' } };
    const update = { ...req.body };
    delete update.name;
    const options = { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true };
    const savedStanding = await Standing.findOneAndUpdate(
      query,
      { $set: update, $setOnInsert: { name: req.body.name } },
      options
    );
    res.status(201).json(savedStanding);
  } catch {
    res.status(400).json({ error: 'Invalid request' });
  }
});

app.delete('/api/standings/:id', requireAuth, mutationRateLimit, async (req, res) => {
  try { await Standing.findByIdAndDelete(req.params.id); res.json({ message: 'Team removed' }); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});


// ==========================================================
// 📸 CLOUDINARY IMAGE UPLOAD ENDPOINT
// ==========================================================
// Note: We also protect the upload route so randos can't upload to your Cloudinary!
const hasValidImageSignature = (file) => {
  const header = file.buffer.subarray(0, 12);
  if (file.mimetype === 'image/jpeg') return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  if (file.mimetype === 'image/png') return header.toString('hex', 0, 8) === '89504e470d0a1a0a';
  if (file.mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(header.toString('ascii', 0, 6));
  if (file.mimetype === 'image/webp') return header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
  return false;
};

app.post('/api/upload', uploadRateLimit, requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  if (!hasValidImageSignature(req.file)) {
    return res.status(400).json({ success: false, message: 'Unsupported or invalid image file.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'junda_united', timeout: 120000 }, 
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload failed');
        return res.status(502).json({ success: false, message: 'Image upload failed.' });
      }
      res.json({ success: true, url: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'Image file is too large.' });
    }
    return res.status(400).json({ success: false, message: 'Invalid image upload.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }

  if (error.message === 'Origin not allowed') {
    return res.status(403).json({ error: 'Origin is not allowed.' });
  }

  console.error('Unhandled API request error');
  return res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    initialConnectionSettled = true;
    app.listen(PORT, () => console.log(`🛰️  Backend API Active on http://localhost:${PORT}`));
  } catch (error) {
    startupFailed = true;
    initialConnectionSettled = true;
    console.error(`❌ MongoDB startup connection failed: ${error.name || 'unknown error'}`);
    process.exitCode = 1;
  }
}

startServer();
