const cron = require('node-cron');
const Reminder = require('../models/reminder.model');
const { sendReminderSMS } = require('./reminder.service');

const startScheduler = () => {

    // Morning reminder — 8:00 AM every day
    cron.schedule('0 8 * * *', async () => {
        console.log('Running morning reminders...');
        await sendScheduledReminders('morning');
    });

    // Afternoon reminder — 2:00 PM every day
    cron.schedule('0 14 * * *', async () => {
        console.log('Running afternoon reminders...');
        await sendScheduledReminders('afternoon');
    });

    // Night reminder — 9:00 PM every day
    cron.schedule('0 21 * * *', async () => {
        console.log('Running night reminders...');
        await sendScheduledReminders('night');
    });

    console.log('✅ Reminder scheduler started');
};

const sendScheduledReminders = async (timeOfDay) => {
    try {
        const now = new Date();

        // Find all active reminders for this time
        const reminders = await Reminder.find({
            isActive: true,
            endDate: { $gte: now },
            [`reminderTimes.${timeOfDay}`]: true
        });

        console.log(`Sending ${reminders.length} ${timeOfDay} reminders`);

        for (const reminder of reminders) {
            try {
                for (const medicine of reminder.medicines) {
                    await sendReminderSMS(
                        reminder.phoneNumber,
                        medicine.name,
                        medicine.timing || 'As directed',
                        medicine.frequency || ''
                    );
                }
            } catch (smsError) {
                console.error(`SMS failed for ${reminder.phoneNumber}:`, smsError.message);
            }
        }
    } catch (error) {
        console.error('Scheduler error:', error.message);
    }
};

module.exports = { startScheduler };