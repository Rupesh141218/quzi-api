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
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
// Configure middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Session configuration
app.use((0, express_session_1.default)({
    secret: constant_1.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3 * 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    },
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
