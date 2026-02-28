
exports.simplifyText = async (req, res, next) => {
    try {
        const data = req.body; //  req.file for uplds
        // lllogic
        res.status(200).json({ message: "Data simplified", data });
    } catch (err) {
        next(err);
    }
};