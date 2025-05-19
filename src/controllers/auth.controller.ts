// src/controllers/auth.controller.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import UserModel from '../models/User.js';
import { PlatformRole, RestaurantRole } from '../types/roles.js';

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * POST /api/auth/register
 */
export const register: RequestHandler = async (req, res) => {
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
  const userDoc = isRestaurantRole
    ? { email, passwordHash, role, restaurant }
    : { email, passwordHash, role };

  await UserModel.create(userDoc);
  res.status(201).json({ message: 'User registered successfully' });
};

/**
 * POST /api/auth/login
 */
export const login: RequestHandler = async (req, res) => {
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

  // Build sign options, casting our string into ms.StringValue
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };

  const payload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, signOptions);

  res.status(200).json({ token });
};
