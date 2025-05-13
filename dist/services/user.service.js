"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = exports.isEmailTaken = void 0;
const user_model_1 = require("../models/user.model");
const admin_model_1 = require("../models/admin.model");
const google_users_model_1 = require("../models/google-users.model");
/**
 * Check if email exists in any user collection
 */
const isEmailTaken = async (email) => {
    const [googleUser, localUser, adminUser] = await Promise.all([
        google_users_model_1.GoogleUser.findOne({ email }),
        user_model_1.User.findOne({ email }),
        admin_model_1.Admin.findOne({ email }),
    ]);
    return !!(googleUser || localUser || adminUser);
};
exports.isEmailTaken = isEmailTaken;
/**
 * Get user type and data by email
 */
const getUserByEmail = async (email) => {
    const googleUser = await google_users_model_1.GoogleUser.findOne({ email });
    if (googleUser) {
        return { userType: 'google', userData: googleUser };
    }
    const localUser = await user_model_1.User.findOne({ email });
    if (localUser) {
        return { userType: 'local', userData: localUser };
    }
    const adminUser = await admin_model_1.Admin.findOne({ email });
    if (adminUser) {
        return { userType: 'admin', userData: adminUser };
    }
    return { userType: null, userData: null };
};
exports.getUserByEmail = getUserByEmail;
