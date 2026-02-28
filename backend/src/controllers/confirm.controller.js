
const Prescription = require("../models/prescription.model");

exports.confirmPrescription = async (req, res, next) => {
    try {
        const { id } = req.params;

        const prescription = await Prescription.findById(id);
        if (!prescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        prescription.status = "confirmed";
        const pre=await prescription.save();
        //  res.send(pre);
        res.status(200).json({
            message: "Prescription confirmed successfully",
            data: prescription
        });
        
    } catch (err) {
        next(err);
    }
};