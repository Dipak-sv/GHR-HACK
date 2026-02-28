const express = require('express');
const router = express.Router();

router.get('/prescription/:sessionId', (req, res) => {
  res.json({ message: 'prescription route working' });
});

module.exports = router;