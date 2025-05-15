import {
  SESSION_SECRET,
  PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
} from './config/constant';

import express from 'express';
import cors from 'cors';
import { dbConnection } from './config/dbConnection';
import { authRoute } from './routes/auth.routes';
import passport from 'passport';
import { configurePassport } from './config/passport';

import session from 'express-session';
import cookieSession from 'cookie-session';

const app = express();

// Configure middleware
// app.use(cors());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('🚀 ~ JWT_SECRET:', JWT_SECRET);
console.log('🚀 ~ GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET);
console.log('🚀 ~ GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
console.log('🚀 ~ SESSION_SECRET:', SESSION_SECRET);

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

app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY || ''],
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: 'lax', // Helps with CSRF
    domain:
      process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined, // Set to your domain in production
  }),
);

// Initialize and configure Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

app.use('/api/auth', authRoute);
dbConnection();

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

export default app;
