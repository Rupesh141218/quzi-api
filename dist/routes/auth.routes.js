"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("../controllers/auth.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
exports.authRoute = express_1.default.Router();
// Local user authentication routes
exports.authRoute.post('/signup', auth_controllers_1.signup);
exports.authRoute.post('/login', auth_controllers_1.login);
// Admin authentication routes
exports.authRoute.post('/admin/signup', auth_controllers_1.createAdmin);
exports.authRoute.post('/admin/login', auth_controllers_1.adminLogin);
// Google OAuth routes
exports.authRoute.get('/google', auth_controllers_1.googleAuth);
exports.authRoute.get('/google/callback', auth_controllers_1.googleCallback);
// Login route
exports.authRoute.get('/verify', auth_middleware_1.isAuth, auth_controllers_1.verifyToken);
exports.authRoute.post('/logout', auth_middleware_1.isAuth, auth_controllers_1.logout);
exports.authRoute.get('/profile', auth_middleware_1.isAuth, user_controller_1.getProfile);
