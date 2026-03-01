const User = require('../models/user.model');
const { generateToken } = require('../config/jwt');

// REGISTER
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'name, email, password and role are required'
            });
        }

        // Validate role
        if (!['patient', 'pharmacist'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_ROLE',
                message: 'Role must be patient or pharmacist'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'EMAIL_EXISTS',
                message: 'An account with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            phone: phone || ''
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

// LOGIN
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

// GET CURRENT USER
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (error) {
        next(error);
    }
};
