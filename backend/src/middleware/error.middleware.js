
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // log error in console
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;