// src/middleware/auth/requireRole.ts
import { Request, Response, NextFunction } from 'express';
import { AnyRole } from '../../types/roles.js';

export const requireRole = (allowedRoles: AnyRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthenticated' });
      return;
    }
    if (!allowedRoles.includes(user.role as AnyRole)) {
      res.status(403).json({ message: 'Forbidden: insufficient privileges' });
      return;
    }
    next();
  };
};
