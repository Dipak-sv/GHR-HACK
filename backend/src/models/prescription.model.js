// FILE 1: backend/src/models/prescription.model.js
// ============================================================

const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:       { type: String, default: '' },
  dosage:     { type: String, default: '' },
  frequency:  { type: String, default: '' },
  duration:   { type: String, default: '' },
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'low' }
}, { _id: false });

const flagSchema = new mongoose.Schema({
  field:    { type: String },
  rule:     { type: String },
  severity: { type: String, enum: ['CRITICAL', 'WARNING'] },
  message:  { type: String }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  extractedData: {
    medicines:   { type: [medicineSchema], default: [] },
    doctorNotes: { type: String, default: '' },
    warnings:    { type: [String], default: [] }
  },
  safetyAnalysis: {
    safetyScore: { type: Number, default: 0 },
    flags:       { type: [flagSchema], default: [] },
    overallRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
  },
  simplifiedOutput: {
    english: { type: String, default: '' },
    hindi:   { type: String, default: '' },
    marathi: { type: String, default: '' }
  },
  humanVerified: { type: Boolean, default: false },
  confirmedAt:   { type: Date }
}, { timestamps: true });

// Auto delete after 24 hours
prescriptionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Prescription', prescriptionSchema);