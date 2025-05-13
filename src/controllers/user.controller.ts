import type { Request, Response } from 'express';
import { User, type IUser } from '../models/user.model';

import { Admin, IAdmin } from '../models/admin.model';
import { IGoogleUser } from '../models/google-users.model';

/**
 * Get current user profile
 */
export const getProfile = (req: Request, res: Response): void => {
  const user = req.user as any;

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
  } else if (user.userType === 'admin') {
    Object.assign(userProfile, {
      role: user.role,
    });
  }

  res
    .status(200)
    .json({ message: 'profile data has been fetched', data: userProfile });
};
