import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { generateToken } from '../config/jwt.config';
import { User, type IUser } from '../models/user.model';
import { loginSchema, signupSchema, validateInput } from '../utils/validations';
import { isEmailTaken } from '../services/user.service';
import { z } from 'zod';
import { Admin, IAdmin } from '../models/admin.model';
import { IGoogleUser } from '../models/google-users.model';

/**
 * User signup with email and password
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validation = validateInput(signupSchema, req.body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const { email, password, firstName, lastName } = validation.data;

    // Check if email is already taken in any user collection
    const emailExists = await isEmailTaken(email);
    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
      return;
    }

    // Create new local user
    const user = await User.create({
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      profilePhoto: '',
    });

    res.status(201).json({
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup',
    });
  }
};

/**
 * User login with email and password
 */
export const login = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Validate input
    const validation = validateInput(loginSchema, req.body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    passport.authenticate(
      'local',
      { session: false },
      (
        err: any,
        user: IUser | IAdmin | IGoogleUser,
        info: { message: any },
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            message: info?.message || 'Invalid credentials',
          });
        }

        // Generate JWT token
        const token = generateToken(user, 'local');

        res.status(200).json({
          message: 'Login successful',
          user: {
            id: user._id,
            email: user.email,
            userType: 'local',
            firstName: user.firstName,
            lastName: user.lastName,
            token: token,
          },
        });
      },
    )(req, res, next);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

/**
 * Admin login
 */
export const adminLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Validate input
    const validation = validateInput(loginSchema, req.body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    passport.authenticate(
      'admin',
      { session: false },
      (err: any, admin: IAdmin, info: { message: any }) => {
        if (err) {
          return next(err);
        }

        if (!admin) {
          return res.status(401).json({
            success: false,
            message: info?.message || 'Invalid admin credentials',
          });
        }

        // Generate JWT token
        const token = generateToken(admin, 'admin');

        res.status(200).json({
          success: true,
          message: 'Admin login successful',
          user: {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            firstName: admin.firstName,
            lastName: admin.lastName,
            token: token,
            userType: 'admin',
          },
        });
      },
    )(req, res, next);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during admin login',
    });
  }
};

/**
 * Create admin user (protected route)
 */
export const createAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Validate input
    const validation = validateInput(
      signupSchema.extend({
        role: z.string().optional(),
        permissions: z.array(z.string()).optional(),
      }),
      req.body,
    );

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const { email, password, role, permissions } = validation.data;

    // Check if email is already taken in any user collection
    const emailExists = await isEmailTaken(email);
    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
      return;
    }

    // Create new admin user
    const admin = await Admin.create({
      email,
      password,
      role: role || 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating admin user',
    });
  }
};

/**
 * Initiate Google OAuth authentication
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * Handle Google OAuth callback and issue JWT
 */
export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    console.log('🚀 ~ passport.authenticate ~ info:', info);
    console.log('🚀 ~ passport.authenticate ~ user:', user);
    if (err) {
      console.error('Authentication error:', err);
      return res.redirect('/auth/login?error=authentication_failed');
    }

    if (!user) {
      return res.redirect(
        `/auth/login?error=login_failed&message=${encodeURIComponent(
          info?.message || '',
        )}`,
      );
    }

    // Generate JWT token
    const token = generateToken(user, 'google');

    // Redirect to frontend with token
    const clientRedirectUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    console.log(
      '🚀 ~ passport.authenticate ~ clientRedirectUrl:',
      clientRedirectUrl,
    );
    res.redirect(
      `${clientRedirectUrl}/auth/callback?token=${token}&userType=google`,
    );
  })(req, res, next);
};

/**
 * Verify JWT token
 */
export const verifyToken = (req: Request, res: Response): void => {
  const user = req.user as any;

  res.status(200).json({
    authenticated: true,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      userType: user.userType,
      ...(user.userType === 'admin' ? { role: user.role } : {}),
    },
  });
};

/**
 * Logout user
 */
export const logout = (req: Request, res: Response): void => {
  req.logout(() => {
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
