import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const isAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: any, user: Express.User | undefined, info: { message: any }) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          message: 'Unauthorized: Authentication required',
          error: info?.message || 'Invalid token',
        });
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};

/**
 * Middleware to ensure user is an admin
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate(
    'jwt',
    { session: false },
    (
      err: any,
      user: (Express.User & { userType: 'admin' }) | undefined,
      info: { message: any },
    ) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          message: 'Unauthorized: Authentication required',
          error: info?.message || 'Invalid token',
        });
      }

      if (user.userType !== 'admin') {
        return res.status(403).json({
          message: 'Forbidden: Admin access required',
        });
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};
