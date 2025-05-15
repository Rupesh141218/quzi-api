"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.verifyToken = exports.googleCallback = exports.googleAuth = exports.createAdmin = exports.adminLogin = exports.login = exports.signup = void 0;
const passport_1 = __importDefault(require("passport"));
const jwt_config_1 = require("../config/jwt.config");
const user_model_1 = require("../models/user.model");
const validations_1 = require("../utils/validations");
const user_service_1 = require("../services/user.service");
const zod_1 = require("zod");
const admin_model_1 = require("../models/admin.model");
/**
 * User signup with email and password
 */
const signup = async (req, res) => {
    try {
        // Validate input
        const validation = (0, validations_1.validateInput)(validations_1.signupSchema, req.body);
        if (!validation.success) {
            const errors = validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        const { email, password, firstName, lastName } = validation.data;
        // Check if email is already taken in any user collection
        const emailExists = await (0, user_service_1.isEmailTaken)(email);
        if (emailExists) {
            res.status(400).json({
                success: false,
                message: 'Email already in use',
            });
            return;
        }
        // Create new local user
        const user = await user_model_1.User.create({
            email,
            password,
            firstName: firstName || '',
            lastName: lastName || '',
            profilePhoto: '',
        });
        res.status(201).json({
            message: 'User created successfully',
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during signup',
        });
    }
};
exports.signup = signup;
/**
 * User login with email and password
 */
const login = (req, res, next) => {
    try {
        // Validate input
        const validation = (0, validations_1.validateInput)(validations_1.loginSchema, req.body);
        if (!validation.success) {
            const errors = validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        passport_1.default.authenticate('local', { session: false }, (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Invalid credentials',
                });
            }
            // Generate JWT token
            const token = (0, jwt_config_1.generateToken)(user, 'local');
            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    email: user.email,
                    userType: 'local',
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token: token,
                },
            });
        })(req, res, next);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login',
        });
    }
};
exports.login = login;
/**
 * Admin login
 */
const adminLogin = (req, res, next) => {
    try {
        // Validate input
        const validation = (0, validations_1.validateInput)(validations_1.loginSchema, req.body);
        if (!validation.success) {
            const errors = validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        passport_1.default.authenticate('admin', { session: false }, (err, admin, info) => {
            if (err) {
                return next(err);
            }
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Invalid admin credentials',
                });
            }
            // Generate JWT token
            const token = (0, jwt_config_1.generateToken)(admin, 'admin');
            res.status(200).json({
                success: true,
                message: 'Admin login successful',
                user: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    token: token,
                    userType: 'admin',
                },
            });
        })(req, res, next);
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during admin login',
        });
    }
};
exports.adminLogin = adminLogin;
/**
 * Create admin user (protected route)
 */
const createAdmin = async (req, res) => {
    try {
        // Validate input
        const validation = (0, validations_1.validateInput)(validations_1.signupSchema.extend({
            role: zod_1.z.string().optional(),
            permissions: zod_1.z.array(zod_1.z.string()).optional(),
        }), req.body);
        if (!validation.success) {
            const errors = validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        const { email, password, role, permissions } = validation.data;
        // Check if email is already taken in any user collection
        const emailExists = await (0, user_service_1.isEmailTaken)(email);
        if (emailExists) {
            res.status(400).json({
                success: false,
                message: 'Email already in use',
            });
            return;
        }
        // Create new admin user
        const admin = await admin_model_1.Admin.create({
            email,
            password,
            role: role || 'admin',
        });
        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
        });
    }
    catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating admin user',
        });
    }
};
exports.createAdmin = createAdmin;
/**
 * Initiate Google OAuth authentication
 */
exports.googleAuth = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
});
/**
 * Handle Google OAuth callback and issue JWT
 */
const googleCallback = (req, res, next) => {
    passport_1.default.authenticate('google', { session: false }, (err, user, info) => {
        console.log('🚀 ~ passport.authenticate ~ info:', info);
        console.log('🚀 ~ passport.authenticate ~ user:', user);
        if (err) {
            console.error('Authentication error:', err);
            return res.redirect('/auth/login?error=authentication_failed');
        }
        if (!user) {
            return res.redirect(`/auth/login?error=login_failed&message=${encodeURIComponent(info?.message || '')}`);
        }
        // Generate JWT token
        const token = (0, jwt_config_1.generateToken)(user, 'google');
        // Redirect to frontend with token
        const clientRedirectUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        console.log('🚀 ~ passport.authenticate ~ clientRedirectUrl:', clientRedirectUrl);
        res.redirect(`${clientRedirectUrl}/auth/callback?token=${token}&userType=google`);
    })(req, res, next);
};
exports.googleCallback = googleCallback;
/**
 * Verify JWT token
 */
const verifyToken = (req, res) => {
    const user = req.user;
    res.status(200).json({
        authenticated: true,
        user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            userType: user.userType,
            ...(user.userType === 'admin' ? { role: user.role } : {}),
        },
    });
};
exports.verifyToken = verifyToken;
/**
 * Logout user
 */
const logout = (req, res) => {
    req.logout(() => {
        res.status(200).json({ message: 'Logged out successfully' });
    });
};
exports.logout = logout;
