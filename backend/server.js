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

const requiredAuthEnvironmentVariables = ['ADMIN_USER', 'ADMIN_PASS', 'JWT_SECRET'];
const missingAuthEnvironmentVariables = requiredAuthEnvironmentVariables.filter(
  (name) => !process.env[name]?.trim()
);

if (missingAuthEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required authentication environment variable(s): ${missingAuthEnvironmentVariables.join(', ')}`
  );
}

const { ADMIN_USER, ADMIN_PASS, JWT_SECRET } = process.env;
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

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

const loginRateLimit = (req, res, next) => {
  const now = Date.now();
  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const current = loginAttempts.get(clientKey);

  if (!current || now - current.windowStart >= LOGIN_WINDOW_MS) {
    loginAttempts.set(clientKey, { windowStart: now, count: 1 });
    return next();
  }

  if (current.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((LOGIN_WINDOW_MS - (now - current.windowStart)) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
  }

  current.count += 1;
  return next();
};

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
  .catch(() => console.error('❌ Database connection failed'));

// Test Endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Junda United API is alive and kicking!" });
});


// ==========================================================
// 🔐 SECURE ADMIN LOGIN ENDPOINT
// ==========================================================
app.post('/api/admin/login', loginRateLimit, (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    loginAttempts.delete(req.ip || req.socket.remoteAddress || 'unknown');
    const token = jwt.sign(
      { username: ADMIN_USER, role: 'admin' }, 
      JWT_SECRET,
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
    const decoded = jwt.verify(token, JWT_SECRET);
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
  catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/news', requireAuth, async (req, res) => {
  try { res.status(201).json(await new News(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.put('/api/news/:id', requireAuth, async (req, res) => {
  try { res.json(await News.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.delete('/api/news/:id', requireAuth, async (req, res) => {
  try { await News.findByIdAndDelete(req.params.id); res.json({ message: 'Article wiped clean' }); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});


// ==========================================================
// ⚽ SQUAD ROSTER ENDPOINTS
// ==========================================================
app.get('/api/players', async (req, res) => {
  try { res.json(await Player.find()); } catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/players', requireAuth, async (req, res) => {
  try { res.status(201).json(await new Player(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.put('/api/players/:id', requireAuth, async (req, res) => {
  try { res.json(await Player.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.delete('/api/players/:id', requireAuth, async (req, res) => {
  try { await Player.findByIdAndDelete(req.params.id); res.json({ message: 'Player removed' }); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});


// ==========================================================
// 📸 GALLERY ENDPOINTS
// ==========================================================
app.get('/api/gallery', async (req, res) => {
  try { res.json(await Gallery.find()); } catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/gallery', requireAuth, async (req, res) => {
  try { res.status(201).json(await new Gallery(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.delete('/api/gallery/:id', requireAuth, async (req, res) => {
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

app.post('/api/fixtures', requireAuth, async (req, res) => {
  try { res.status(201).json(await new Fixture(req.body).save()); } 
  catch { res.status(400).json({ error: 'Invalid request' }); }
});

app.delete('/api/fixtures/:id', requireAuth, async (req, res) => {
  try { await Fixture.findByIdAndDelete(req.params.id); res.json({ message: 'Fixture removed' }); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});


// ==========================================================
// 📊 LEAGUE STANDINGS ENDPOINTS
// ==========================================================
app.get('/api/standings', async (req, res) => {
  try { res.json(await Standing.find().sort({ rank: 1 })); } 
  catch { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/standings', requireAuth, async (req, res) => {
  try {
    const query = { name: req.body.name };
    const update = req.body;
    const options = { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true };
    res.status(201).json(await Standing.findOneAndUpdate(query, update, options));
  } catch {
    res.status(400).json({ error: 'Invalid request' });
  }
});

app.delete('/api/standings/:id', requireAuth, async (req, res) => {
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

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
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

// Boot listening port execution
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🛰️  Backend API Active on http://localhost:${PORT}`));
