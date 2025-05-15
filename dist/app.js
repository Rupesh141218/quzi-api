"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./config/constant");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbConnection_1 = require("./config/dbConnection");
const auth_routes_1 = require("./routes/auth.routes");
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const cookie_session_1 = __importDefault(require("cookie-session"));
const app = (0, express_1.default)();
// Configure middleware
// app.use(cors());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
console.log('🚀 ~ JWT_SECRET:', constant_1.JWT_SECRET);
console.log('🚀 ~ GOOGLE_CLIENT_SECRET:', constant_1.GOOGLE_CLIENT_SECRET);
console.log('🚀 ~ GOOGLE_CLIENT_ID:', constant_1.GOOGLE_CLIENT_ID);
console.log('🚀 ~ SESSION_SECRET:', constant_1.SESSION_SECRET);
// // Session configuration
// app.use(
//   session({
//     secret: SESSION_SECRET as string,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 3 * 24 * 60 * 60 * 1000, // 24 hours
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//     },
//   }),
// );
app.use((0, cookie_session_1.default)({
    name: 'session',
    keys: [process.env.COOKIE_KEY || ''],
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: 'lax', // Helps with CSRF
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined, // Set to your domain in production
}));
// Initialize and configure Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_2.configurePassport)();
app.use('/api/auth', auth_routes_1.authRoute);
(0, dbConnection_1.dbConnection)();
app.listen(constant_1.PORT, () => {
    console.log(`App is running on port ${constant_1.PORT}`);
});
exports.default = app;
