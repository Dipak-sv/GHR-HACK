const express  = require('express');
const router   = express.Router();
const { confirmPrescription } = require('../controllers/confirm.controller');

router.post('/confirm', confirmPrescription);

module.exports = router;