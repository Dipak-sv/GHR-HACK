
const express = require('express');
const router = express.Router();
const { confirmPrescription } = require('../controllers/confirm.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.post('/confirm', protect, restrictTo('pharmacist'), confirmPrescription);

module.exports = router;