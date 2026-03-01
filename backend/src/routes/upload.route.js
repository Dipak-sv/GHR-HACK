const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { uploadImage } = require('../controllers/upload.controller');

router.post('/upload', upload.single('image'), uploadImage);

module.exports = router;
