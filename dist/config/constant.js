"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_SECRET = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.JWT_SECRET = exports.MONGODB_URI = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.APP_PORT || 8000;
exports.MONGODB_URI = process.env.DB_URI || '';
exports.JWT_SECRET = process.env.AUTH_SECRET;
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
exports.SESSION_SECRET = process.env.COOKIE_KEY;
