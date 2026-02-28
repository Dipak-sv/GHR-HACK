const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const uploadRoute       = require('./routes/upload.route');
const simplifyRoute     = require('./routes/simplify.route');
const confirmRoute      = require('./routes/confirm.route');
const prescriptionRoute = require('./routes/prescription.route');
const errorMiddleware   = require('./middleware/error.middleware');

const app = express();

// ── Ensure uploads folder exists ──────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
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