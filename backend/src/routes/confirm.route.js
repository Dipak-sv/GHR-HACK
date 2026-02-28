const express = require('express');
const router = express.Router();

router.post('/confirm', (req, res) => {
  res.json({ message: 'confirm route working' });
});

module.exports = router;