"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const user_model_1 = require("../models/user.model");
const admin_model_1 = require("../models/admin.model");
const google_users_model_1 = require("../models/google-users.model");
const constant_1 = require("./constant");
const user_service_1 = require("../services/user.service");
const configurePassport = () => {
    // Validate required environment variables
    if (!constant_1.GOOGLE_CLIENT_ID || !constant_1.GOOGLE_CLIENT_SECRET) {
        throw new Error('Missing required Google OAuth credentials in environment variables');
    }
    if (!constant_1.JWT_SECRET) {
        throw new Error('Missing required JWT secret in environment variables');
    }
    // Configure Local Strategy for email/password login
    passport_1.default.use('local', new passport_local_1.Strategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            // Find user by email
            const user = await user_model_1.User.findOne({ email });
            // Check if user exists
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect email or password',
                });
            }
            // Check if password is correct
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, {
                    message: 'Incorrect email or password',
                });
            }
            // Authentication successful
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    // Configure Admin Strategy for admin login
    passport_1.default.use('admin', new passport_local_1.Strategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            // Find admin by email
            const admin = await admin_model_1.Admin.findOne({ email });
            // Check if admin exists
            if (!admin) {
                return done(null, false, {
                    message: 'Incorrect email or password',
                });
            }
            // Check if password is correct
            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                return done(null, false, {
                    message: 'Incorrect email or password',
                });
            }
            // Authentication successful
            return done(null, admin);
        }
        catch (error) {
            return done(error);
        }
    }));
    // Configure Google OAuth strategy
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: constant_1.GOOGLE_CLIENT_ID,
        clientSecret: constant_1.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://quiz-app-l46p06dah-nabraj-chaudharys-projects.vercel.app/api/auth/google/callback',
        scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Find existing user by Google ID
            let user = await google_users_model_1.GoogleUser.findOne({ googleId: profile.id });
            // If user doesn't exist, check if email is already taken
            if (!user && profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                const emailExists = await (0, user_service_1.isEmailTaken)(email);
                if (emailExists) {
                    return done(null, false, {
                        message: 'Email already in use with another account type',
                    });
                }
                // Create new user
                user = await google_users_model_1.GoogleUser.create({
                    googleId: profile.id,
                    email: email,
                    firstName: profile.name?.givenName || '',
                    lastName: profile.name?.familyName || '',
                    profilePhoto: profile.photos?.[0]?.value || '',
                });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    // Configure JWT strategy
    passport_1.default.use(new passport_jwt_1.Strategy({
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: constant_1.JWT_SECRET,
    }, async (jwtPayload, done) => {
        try {
            const { sub, type } = jwtPayload;
            let user = null;
            // Find user based on type
            switch (type) {
                case 'google':
                    user = await google_users_model_1.GoogleUser.findById(sub);
                    break;
                case 'local':
                    user = await user_model_1.User.findById(sub);
                    break;
                case 'admin':
                    user = await admin_model_1.Admin.findById(sub);
                    break;
                default:
                    return done(null, false);
            }
            if (!user) {
                return done(null, false);
            }
            // Add user type to the user object
            const userWithType = {
                ...user.toObject(),
                userType: type,
            };
            return done(null, userWithType);
        }
        catch (error) {
            return done(error, false);
        }
    }));
    // Configure user serialization (for storing in session)
    passport_1.default.serializeUser((user, done) => {
        // Store both the user ID and type
        done(null, { id: user._id.toString(), type: user.userType || 'local' });
    });
    // Configure user deserialization (for retrieving from session)
    passport_1.default.deserializeUser(async (data, done) => {
        try {
            let user = null;
            // Find user based on type
            switch (data.type) {
                case 'google':
                    user = await google_users_model_1.GoogleUser.findById(data.id);
                    break;
                case 'local':
                    user = await user_model_1.User.findById(data.id);
                    break;
                case 'admin':
                    user = await admin_model_1.Admin.findById(data.id);
                    break;
                default:
                    return done(new Error('Invalid user type'));
            }
            if (!user) {
                return done(new Error('User not found'));
            }
            // Add user type to the user object
            const userWithType = {
                ...user.toObject(),
                userType: data.type,
            };
            done(null, userWithType);
        }
        catch (error) {
            console.error('Error deserializing user:', error);
            done(error instanceof Error ? error : new Error(String(error)));
        }
    });
};
exports.configurePassport = configurePassport;
