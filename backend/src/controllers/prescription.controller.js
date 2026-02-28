
const Prescription = require("../models/prescription.model");

exports.getPrescription = async (req, res, next) => {
    try {
        const { id } = req.params; // Get the id from the path

        // Validate id format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid prescription ID" });
        }

        // Fetch prescription from MongoDB
        const prescription = await Prescription.findById(id);

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        // Convert file buffer to Base64 if it exists (for frontend display)
        let fileData = null;
        if (prescription.prescriptionFile && prescription.prescriptionFile.data) {
            fileData = {
                data: prescription.prescriptionFile.data.toString("base64"),
                contentType: prescription.prescriptionFile.contentType
            };
        }

        res.status(200).json({
            success: true,
            data: {
                patientName: prescription.patientName,
                doctorName: prescription.doctorName,
                status: prescription.status,
                prescriptionFile: fileData
            }
        });
    } catch (err) {
        next(err); // Pass error to global error handler
    }
};