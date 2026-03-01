const Reminder = require('../models/reminder.model');
const Prescription = require('../models/prescription.model');
const { sendReminderSMS } = require('../services/reminder.service');

// SET REMINDER
exports.setReminder = async (req, res, next) => {
    try {
        const { sessionId, phoneNumber, reminderTimes, durationDays } = req.body;

        if (!sessionId || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'sessionId and phoneNumber are required'
            });
        }

        // Validate phone number format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PHONE',
                message: 'Phone number must be in format +91XXXXXXXXXX'
            });
        }

        // Get prescription
        const prescription = await Prescription.findOne({ sessionId });
        if (!prescription) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'Prescription not found'
            });
        }



        // Calculate end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (durationDays || 7));

        // Create reminder
        const reminder = await Reminder.create({
            sessionId,
            patientName: prescription.extractedData.patientName || '',
            phoneNumber,
            medicines: prescription.extractedData.medicines,
            reminderTimes: reminderTimes || {
                morning: true,
                afternoon: false,
                night: true
            },
            endDate
        });

        // Send immediate confirmation SMS
        const medicineNames = prescription.extractedData.medicines
            .map(m => m.name)
            .join(', ');

        let smsStatus = 'sent';
        let smsError = null;

        try {
            await sendReminderSMS(
                phoneNumber,
                medicineNames,
                'Reminder set successfully',
                `You will receive reminders for: ${medicineNames}`
            );
            console.log(`Confirmation SMS sent to ${phoneNumber}`);
        } catch (twilioErr) {
            console.error('Twilio SMS Error:', twilioErr.message);
            smsStatus = 'failed';
            smsError = twilioErr.message;
        }

        return res.status(201).json({
            success: true,
            message: 'Reminder saved' + (smsStatus === 'failed' ? ' but SMS failed.' : '!'),
            reminderId: reminder._id,
            phoneNumber,
            reminderTimes,
            endDate,
            smsStatus,
            smsError
        });

    } catch (error) {
        console.error('Set Reminder Error:', error);
        next(error);
    }
};

// SEND TEST SMS
exports.sendTestSMS = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PHONE',
                message: 'phoneNumber is required'
            });
        }

        await sendReminderSMS(
            phoneNumber,
            'Paracetamol 500mg',
            'After food',
            'Twice daily'
        );

        return res.status(200).json({
            success: true,
            message: 'Test SMS sent successfully'
        });

    } catch (error) {
        next(error);
    }
};

// GET REMINDERS FOR SESSION
exports.getReminders = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const reminders = await Reminder.find({ sessionId, isActive: true });

        return res.status(200).json({
            success: true,
            reminders
        });

    } catch (error) {
        next(error);
    }
};

// CANCEL REMINDER
exports.cancelReminder = async (req, res, next) => {
    try {
        const { reminderId } = req.params;

        await Reminder.findByIdAndUpdate(reminderId, { isActive: false });

        return res.status(200).json({
            success: true,
            message: 'Reminder cancelled'
        });

    } catch (error) {
        next(error);
    }
};