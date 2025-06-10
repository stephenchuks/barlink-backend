import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        restaurant?: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  role: string;
  restaurant?: string;
  iat: number;
  exp: number;
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET as jwt.Secret;
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      id: payload.userId,
      role: payload.role,
      restaurant: payload.restaurant,
    };
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
