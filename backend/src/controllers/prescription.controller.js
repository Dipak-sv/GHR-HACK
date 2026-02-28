exports.getPrescription = async (req, res, next) => {
    try {
        res.status(200).json({
            message: "Prescription fetched successfully"
        });
    } catch (err) {
        next(err);
    }
};