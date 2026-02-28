const Prescription = require('../models/prescription.model');

exports.getPrescription = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SESSION',
        message: 'sessionId is required'
      });
    }

    const prescription = await Prescription.findOne({ sessionId });
    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Prescription not found'
      });
    }

    // Hard gate — never return unverified data
    if (!prescription.humanVerified) {
      return res.status(403).json({
        success: false,
        error: 'NOT_VERIFIED',
        message: 'Prescription not yet verified by human'
      });
    }

    return res.status(200).json({
      success: true,
      sessionId,
      extractedData:    prescription.extractedData,
      safetyAnalysis:   prescription.safetyAnalysis,
      simplifiedOutput: prescription.simplifiedOutput,
      confirmedAt:      prescription.confirmedAt
    });

  } catch (error) {
    next(error);
  }
};
