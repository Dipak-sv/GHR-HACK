const express = require('express');
const router = express.Router();

router.post('/simplify', (req, res) => {
  res.json({ message: 'simplify route working' });
});

module.exports = router;