const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const uploadRoute = require('./routes/upload.route');
const simplifyRoute = require('./routes/simplify.route');
const confirmRoute = require('./routes/confirm.route');
const prescriptionRoute = require('./routes/prescription.route');
const authRoute = require('./routes/auth.route');
const reminderRoute = require('./routes/reminder.route');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// ── Ensure uploads folder exists ──────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security & Core Middleware ─────────────────────────
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per windowMs per IP
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', apiLimiter);

const allowedOrigin = process.env.FRONTEND_URL && process.env.FRONTEND_URL !== '*'
  ? process.env.FRONTEND_URL
  : '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// ── Test upload page ───────────────────────────────────
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-upload.html'));
});

// ── Routes ─────────────────────────────────────────────
app.use('/api', uploadRoute);
app.use('/api', simplifyRoute);
app.use('/api', confirmRoute);
app.use('/api', prescriptionRoute);
app.use('/api', reminderRoute);
app.use('/api/auth', authRoute);

// ── 404 handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.originalUrl} not found`
  });
});

// ── Global error handler (must be last) ───────────────
app.use(errorMiddleware);

module.exports = app;