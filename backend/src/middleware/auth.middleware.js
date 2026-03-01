const { verifyToken } = require('../config/jwt');

// Protect any route — requires valid JWT
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Token is invalid or expired'
        });
    }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: `Access denied. ${req.user.role} cannot perform this action`
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
