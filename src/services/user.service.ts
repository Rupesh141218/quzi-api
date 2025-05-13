import { User, type IUser } from '../models/user.model';
import { Admin, type IAdmin } from '../models/admin.model';
import { GoogleUser, type IGoogleUser } from '../models/google-users.model';

/**
 * Check if email exists in any user collection
 */
export const isEmailTaken = async (email: string): Promise<boolean> => {
  const [googleUser, localUser, adminUser] = await Promise.all([
    GoogleUser.findOne({ email }),
    User.findOne({ email }),
    Admin.findOne({ email }),
  ]);

  return !!(googleUser || localUser || adminUser);
};

/**
 * Get user type and data by email
 */
export const getUserByEmail = async (
  email: string,
): Promise<{
  userType: 'google' | 'local' | 'admin' | null;
  userData: any;
}> => {
  const googleUser = await GoogleUser.findOne({ email });
  if (googleUser) {
    return { userType: 'google', userData: googleUser };
  }

  const localUser = await User.findOne({ email });
  if (localUser) {
    return { userType: 'local', userData: localUser };
  }

  const adminUser = await Admin.findOne({ email });
  if (adminUser) {
    return { userType: 'admin', userData: adminUser };
  }

  return { userType: null, userData: null };
};
