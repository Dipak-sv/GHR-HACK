const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Prescription = require('../models/prescription.model');
const { extractPrescription } = require('../services/ai.service');
const { analyzeSafety } = require('../services/safety.engine');

exports.uploadImage = async (req, res, next) => {
  try {

    // STEP 1 — Validate file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE',
        message: 'No image uploaded'
      });
    }

    // STEP 2 — Generate unique session ID
    const sessionId = uuidv4();

    // STEP 3 — Call Groq Vision AI
    let aiResult;
    try {
      aiResult = await extractPrescription(req.file.path);
    } catch (aiError) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({
        success: false,
        error: 'AI_FAILED',
        message: 'Could not extract prescription data',
        details: aiError.message
      });
    }

    // STEP 4 — Run Safety Engine
    const safetyAnalysis = analyzeSafety(aiResult.extractedData);

    // STEP 5 — Save to MongoDB
    const prescription = new Prescription({
      sessionId,
      extractedData: aiResult.extractedData,
      safetyAnalysis
    });
    await prescription.save();

    // STEP 6 — Delete temp image (privacy)
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // STEP 7 — Return response
    return res.status(200).json({
      success: true,
      sessionId,
      extractedData: aiResult.extractedData,
      safetyAnalysis
    });

  } catch (error) {
    // Always delete temp file on any error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};