const Prescription = require('../models/prescription.model');

exports.confirmPrescription = async (req, res, next) => {
  try {
    const { sessionId, verifiedMedicines, language } = req.body;

    // Validate input
    if (!sessionId || !verifiedMedicines || !language) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'sessionId, verifiedMedicines and language are required'
      });
    }

    if (!Array.isArray(verifiedMedicines)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MEDICINES',
        message: 'verifiedMedicines must be an array'
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

    // Already confirmed guard
    if (prescription.humanVerified) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_CONFIRMED',
        message: 'Prescription already confirmed'
      });
    }

    // Update with human verified medicines
    prescription.extractedData.medicines = verifiedMedicines;
    prescription.humanVerified = true;
    prescription.confirmedAt   = new Date();
    await prescription.save();

    return res.status(200).json({
      success: true,
      status: 'confirmed',
      prescriptionId: prescription._id,
      sessionId
    });

  } catch (error) {
    next(error);
  }
};

