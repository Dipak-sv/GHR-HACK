exports.confirmPrescription = async (req, res, next) => {
    try {
        res.status(200).json({
            message: "Confirm!!"
        });
    } catch (err) {
        next(err);
    }
};