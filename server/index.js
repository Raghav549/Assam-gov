require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const otpRoutes = require('./routes/otpRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

let mongoReady = false;

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not found. Server will run without database-backed OTP storage.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    mongoReady = true;
    console.log('MongoDB connected');
  } catch (error) {
    mongoReady = false;
    console.error('MongoDB connection failed:', error.message);
  }
}

app.use((req, res, next) => {
  req.mongoReady = mongoReady;
  next();
});

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Youth Assam Backend', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: mongoReady ? 'connected' : 'not-connected', time: new Date().toISOString() });
});

app.use('/api/otp', otpRoutes);
app.use('/api/auth', otpRoutes);

const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(buildPath, 'index.html'), (error) => {
    if (error) res.status(404).json({ ok: false, message: 'Frontend build not found. Backend API is running.' });
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ ok: false, message: error.message || 'Internal server error' });
});

connectDatabase().finally(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
