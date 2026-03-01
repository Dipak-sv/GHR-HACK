const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mediscript-secret-2026';
const JWT_EXPIRES = '24h';

const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
