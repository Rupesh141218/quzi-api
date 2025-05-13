"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("./constant");
const generateToken = (user, userType) => {
    if (!constant_1.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({
        sub: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        type: userType,
    }, constant_1.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    if (!constant_1.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.verify(token, constant_1.JWT_SECRET);
};
exports.verifyToken = verifyToken;
