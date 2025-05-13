"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const isAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized: Authentication required',
                error: info?.message || 'Invalid token',
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.isAuth = isAuth;
/**
 * Middleware to ensure user is an admin
 */
const isAdmin = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized: Authentication required',
                error: info?.message || 'Invalid token',
            });
        }
        if (user.userType !== 'admin') {
            return res.status(403).json({
                message: 'Forbidden: Admin access required',
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.isAdmin = isAdmin;
