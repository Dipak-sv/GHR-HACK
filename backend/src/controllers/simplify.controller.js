const Prescription = require('../models/prescription.model');
const { simplifyPrescription } = require('../services/ai.service');

exports.simplifyText = async (req, res, next) => {
  try {
    const { sessionId, language } = req.body;

    // Validate input
    if (!sessionId || !language) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'sessionId and language are required'
      });
    }

    const validLanguages = ['english', 'hindi', 'marathi'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_LANGUAGE',
        message: 'Language must be english, hindi or marathi'
      });
    }

    // Find prescription
    const prescription = await Prescription.findOne({ sessionId });
    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Prescription session not found'
      });
    }

    // Check cache — don't call Groq twice for same language
    if (prescription.simplifiedOutput && prescription.simplifiedOutput[language]) {
      // For retro-compatibility if previously cached as string
      const cached = prescription.simplifiedOutput[language];
      const parsedCached = typeof cached === 'string' ? { instructions: cached, translatedData: prescription.extractedData } : cached;

      return res.status(200).json({
        success: true,
        sessionId,
        simplifiedText: parsedCached.instructions,
        translatedData: parsedCached.translatedData,
        language,
        cached: true
      });
    }

    // Call Groq for simplification
    const result = await simplifyPrescription(
      prescription.extractedData,
      language
    );

    // Save to cache as an object containing both
    if (!prescription.simplifiedOutput) prescription.simplifiedOutput = {};
    prescription.simplifiedOutput[language] = {
      instructions: result.simplifiedText,
      translatedData: result.translatedData
    };

    // We need to tell mongoose that this mixed type changed
    prescription.markModified('simplifiedOutput');
    await prescription.save();

    return res.status(200).json({
      success: true,
      sessionId,
      simplifiedText: result.simplifiedText,
      translatedData: result.translatedData,
      language,
      cached: false
    });

  } catch (error) {
    next(error);
  }
};
