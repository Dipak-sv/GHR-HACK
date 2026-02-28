const express  = require('express');
const router   = express.Router();
const { getPrescription } = require('../controllers/prescription.controller');

router.get('/prescription/:sessionId', getPrescription);

module.exports = router;