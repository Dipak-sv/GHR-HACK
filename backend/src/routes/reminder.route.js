const express = require('express');
const router = express.Router();
const {
    setReminder,
    sendTestSMS,
    getReminders,
    cancelReminder
} = require('../controllers/reminder.controller');

router.post('/reminder/set', setReminder);
router.post('/reminder/test', sendTestSMS);
router.get('/reminder/:sessionId', getReminders);
router.patch('/reminder/:reminderId/cancel', cancelReminder);

module.exports = router;