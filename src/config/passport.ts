import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User, type IUser } from '../models/user.model';
import { Admin, type IAdmin } from '../models/admin.model';
import { GoogleUser, type IGoogleUser } from '../models/google-users.model';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET } from './constant';
import { isEmailTaken } from '../services/user.service';

export const configurePassport = () => {
  // Validate required environment variables
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      'Missing required Google OAuth credentials in environment variables',
    );
  }

  if (!JWT_SECRET) {
    throw new Error('Missing required JWT secret in environment variables');
  }

  // Configure Local Strategy for email/password login
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({ email });

          // Check if user exists
          if (!user) {
            return done(null, false, {
              message: 'Incorrect email or password',
            });
          }

          // Check if password is correct
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, {
              message: 'Incorrect email or password',
            });
          }

          // Authentication successful
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // Configure Admin Strategy for admin login
  passport.use(
    'admin',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find admin by email
          const admin = await Admin.findOne({ email });

          // Check if admin exists
          if (!admin) {
            return done(null, false, {
              message: 'Incorrect email or password',
            });
          }

          // Check if password is correct
          const isMatch = await admin.comparePassword(password);
          if (!isMatch) {
            return done(null, false, {
              message: 'Incorrect email or password',
            });
          }

          // Authentication successful
          return done(null, admin);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID as string,
        clientSecret: GOOGLE_CLIENT_SECRET as string,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find existing user by Google ID
          let user = await GoogleUser.findOne({ googleId: profile.id });

          // If user doesn't exist, check if email is already taken
          if (!user && profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            const emailExists = await isEmailTaken(email);

            if (emailExists) {
              return done(null, false, {
                message: 'Email already in use with another account type',
              });
            }

            // Create new user
            user = await GoogleUser.create({
              googleId: profile.id,
              email: email,
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              profilePhoto: profile.photos?.[0]?.value || '',
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );

  // Configure JWT strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const { sub, type } = jwtPayload;
          let user = null;

          // Find user based on type
          switch (type) {
            case 'google':
              user = await GoogleUser.findById(sub);
              break;
            case 'local':
              user = await User.findById(sub);
              break;
            case 'admin':
              user = await Admin.findById(sub);
              break;
            default:
              return done(null, false);
          }

          if (!user) {
            return done(null, false);
          }

          // Add user type to the user object
          const userWithType = {
            ...user.toObject(),
            userType: type,
          };

          return done(null, userWithType);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  // Configure user serialization (for storing in session)
  passport.serializeUser((user: any, done) => {
    // Store both the user ID and type
    done(null, { id: user._id.toString(), type: user.userType || 'local' });
  });

  // Configure user deserialization (for retrieving from session)
  passport.deserializeUser(async (data: { id: string; type: string }, done) => {
    try {
      let user = null;

      // Find user based on type
      switch (data.type) {
        case 'google':
          user = await GoogleUser.findById(data.id);
          break;
        case 'local':
          user = await User.findById(data.id);
          break;
        case 'admin':
          user = await Admin.findById(data.id);
          break;
        default:
          return done(new Error('Invalid user type'));
      }

      if (!user) {
        return done(new Error('User not found'));
      }

      // Add user type to the user object
      const userWithType = {
        ...user.toObject(),
        userType: data.type,
      };

      done(null, userWithType);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error instanceof Error ? error : new Error(String(error)));
    }
  });
};
