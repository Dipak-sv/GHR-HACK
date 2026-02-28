const express = require('express');
const router = express.Router();

router.post('/upload', (req, res) => {
  res.json({ message: 'upload route working' });
});

module.exports = router;