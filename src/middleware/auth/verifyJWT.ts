// src/middleware/auth/verifyJWT.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../../models/User.js';          // ← two-level up
import { RestaurantRole } from '../../types/roles.js'; // ← two-level up

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
  iat: number;
  exp: number;
}

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as JwtPayload;
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }

  // Load the user document
  const userDoc = await UserModel.findById(payload.userId).exec();
  if (!userDoc) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  // Attach base user info
  req.user = { id: payload.userId, role: payload.role };

  // If this is a restaurant‑scoped role, add restaurant field
  if ((Object.values(RestaurantRole) as string[]).includes(userDoc.role)) {
    // @ts-ignore discriminator property
    req.user.restaurant = (userDoc as any).restaurant.toString();
  }

  next();
};
