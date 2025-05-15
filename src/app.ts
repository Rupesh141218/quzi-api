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

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('🚀 ~ JWT_SECRET:', JWT_SECRET);
console.log('🚀 ~ GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET);
console.log('🚀 ~ GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
console.log('🚀 ~ SESSION_SECRET:', SESSION_SECRET);

// Session configuration
app.use(
  session({
    secret: SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
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
