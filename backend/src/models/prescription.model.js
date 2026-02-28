
const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: true,
        },
        doctorName: {
            type: String,
            required: true,
        },
        prescriptionFile: {
            type: String, // store file path from Multer
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true } 
);

module.exports = mongoose.model("Prescription", prescriptionSchema);