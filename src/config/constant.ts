import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.APP_PORT || 8000;
export const MONGODB_URI = process.env.DB_URI || '';

export const JWT_SECRET = process.env.AUTH_SECRET;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const SESSION_SECRET = process.env.COOKIE_KEY;
