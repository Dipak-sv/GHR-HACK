const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendReminderSMS = async (phoneNumber, medicineName, timing, frequency) => {
    const message = `🏥 Prescripto Reminder\n\nTime to take your medicine:\n💊 ${medicineName}\n⏰ ${frequency}\n🍽️ ${timing || 'As directed'}\n\nStay healthy! - Prescripto`;

    const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
    });

    return result.sid;
};

module.exports = { sendReminderSMS };