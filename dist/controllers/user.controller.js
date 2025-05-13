"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
/**
 * Get current user profile
 */
const getProfile = (req, res) => {
    const user = req.user;
    const userProfile = {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
    };
    // Add user type specific fields
    if (user.userType === 'google' || user.userType === 'local') {
        Object.assign(userProfile, {
            firstName: user.firstName,
            lastName: user.lastName,
            profilePhoto: user.profilePhoto,
        });
    }
    else if (user.userType === 'admin') {
        Object.assign(userProfile, {
            role: user.role,
        });
    }
    res
        .status(200)
        .json({ message: 'profile data has been fetched', data: userProfile });
};
exports.getProfile = getProfile;
