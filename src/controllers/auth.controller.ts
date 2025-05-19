// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel, { PlatformUser, RestaurantUser } from '../models/User.js';
import { PlatformRole, RestaurantRole } from '../types/roles.js';

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'];

// REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, restaurant } = req.body as {
    email?: string;
    password?: string;
    role?: PlatformRole | RestaurantRole;
    restaurant?: string;
  };

  if (!email || !password || !role) {
    res.status(400).json({ message: 'Email, password and role are required' });
    return;
  }

  const isRestaurantRole = Object.values(RestaurantRole).includes(role as RestaurantRole);
  if (isRestaurantRole && !restaurant) {
    res.status(400).json({ message: 'Restaurant ID is required for restaurant-level users' });
    return;
  }

  if (await UserModel.exists({ email })) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (isRestaurantRole) {
    await RestaurantUser.create({
      email,
      passwordHash,
      role,
      restaurant: new mongoose.Types.ObjectId(restaurant!),
    });
  } else {
    await PlatformUser.create({ email, passwordHash, role });
  }

  res.status(201).json({ message: 'User registered successfully' });
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await UserModel.findOne({ email }).exec();
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const userId = (user._id as mongoose.Types.ObjectId).toString();

  const token = jwt.sign(
    { userId, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions,
  );

  res.status(200).json({ token });
};
