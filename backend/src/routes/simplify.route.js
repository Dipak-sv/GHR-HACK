const express  = require('express');
const router   = express.Router();
const { simplifyText } = require('../controllers/simplify.controller');

router.post('/simplify', simplifyText);

module.exports = router;