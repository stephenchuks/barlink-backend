// src/controllers/auth.controller.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import mongoose from 'mongoose';

import UserModel, { PlatformUser, RestaurantUser, IRestaurantUser } from '../models/User.js';
import { PlatformRole, RestaurantRole, AnyRole } from '../types/roles.js';

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * POST /api/auth/register
 */
export const register: RequestHandler = async (req, res) => {
  const { email, password, role, restaurant } = req.body as {
    email?: string;
    password?: string;
    role?: AnyRole;
    restaurant?: string;
  };

  if (!email || !password || !role) {
    res.status(400).json({ message: 'Email, password and role are required' });
    return;
  }

  // is it a restaurant‑scoped role?
  const isRestaurantRole = Object.values(RestaurantRole).includes(role as RestaurantRole);
  if (isRestaurantRole && !restaurant) {
    res.status(400).json({ message: 'Restaurant ID is required for restaurant users' });
    return;
  }

  if (await UserModel.exists({ email })) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (isRestaurantRole) {
    // use RestaurantUser discriminator
    await RestaurantUser.create({
      email,
      passwordHash,
      role: role as RestaurantRole,
      restaurant: new mongoose.Types.ObjectId(restaurant!),
    });
  } else {
    // use PlatformUser discriminator
    await PlatformUser.create({
      email,
      passwordHash,
      role: role as PlatformRole,
    });
  }

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
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // Build JWT payload
  const payload: Record<string, any> = {
    userId: user.id,
    role: user.role,
  };
  // include restaurant for restaurant users
  if ((user as IRestaurantUser).restaurant) {
    payload.restaurant = (user as IRestaurantUser).restaurant.toString();
  }

  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  const token = jwt.sign(payload, JWT_SECRET, signOptions);

  res.status(200).json({ token });
};
