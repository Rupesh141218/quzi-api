import jwt from 'jsonwebtoken';
import type { IUser } from '../models/user.model';
import type { IGoogleUser } from '../models/google-users.model';
import type { IAdmin } from '../models/admin.model';
import { JWT_SECRET } from './constant';

type UserType = 'google' | 'local' | 'admin';

export const generateToken = (
  user: IUser | IAdmin | IGoogleUser,
  userType: UserType,
): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      type: userType,
    },
    JWT_SECRET,
    {
      expiresIn: '1d', // Token expires in 1 day
    },
  );
};

export const verifyToken = (token: string): any => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, JWT_SECRET);
};
