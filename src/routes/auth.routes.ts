import express from 'express';
import {
  adminLogin,
  createAdmin,
  googleAuth,
  googleCallback,
  login,
  logout,
  signup,
  verifyToken,
} from '../controllers/auth.controllers';
import { isAuth } from '../middleware/auth.middleware';
import { getProfile } from '../controllers/user.controller';

export const authRoute = express.Router();

// Local user authentication routes
authRoute.post('/signup', signup);
authRoute.post('/login', login);

// Admin authentication routes
authRoute.post('/admin/signup', createAdmin);
authRoute.post('/admin/login', adminLogin);

// Google OAuth routes
authRoute.get('/google', googleAuth);
authRoute.get('/google/callback', googleCallback);

// Login route
authRoute.get('/verify', isAuth, verifyToken);

authRoute.post('/logout', isAuth, logout);

authRoute.get('/profile', isAuth, getProfile);
