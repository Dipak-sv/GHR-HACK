const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    patientName: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        required: true
    },
    medicines: [
        {
            name: { type: String },
            timing: { type: String },
            frequency: { type: String },
            dosage: { type: String }
        }
    ],
    reminderTimes: {
        morning: { type: Boolean, default: false },
        afternoon: { type: Boolean, default: false },
        night: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);