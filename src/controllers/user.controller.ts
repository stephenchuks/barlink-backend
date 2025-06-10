import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserModel, { RestaurantUser, IRestaurantUser } from '../models/User.js';
import { RestaurantRole } from '../types/roles.js';
import { canCreateRole } from '../utils/roleUtils.js';

// Utility: Who can create what?


/**
 * GET /api/users/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const id = (req.user as { id?: string }).id;
  if (!id) {
    res.status(401).json({ message: 'Unauthenticated' });
    return;
  }

  const user = await UserModel.findById(id).lean().exec();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const { passwordHash, ...rest } = user as any;
  res.status(200).json({ user: rest });
};

/**
 * POST /api/users
 * Must be called by owner or manager
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const authId = (req.user as { id: string }).id;

  // Load the authenticated user from DB
  const creator = await RestaurantUser.findById(authId).exec() as IRestaurantUser | null;
  if (!creator) {
    res.status(401).json({ message: 'Unauthenticated or not a restaurant user' });
    return;
  }

  const tenantId = creator.restaurant.toString();

  const { email, password, role, restaurant } = req.body as {
    email?: string;
    password?: string;
    role?: RestaurantRole;
    restaurant?: string;
  };

  if (!email || !password || !role || !restaurant) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if (!Object.values(RestaurantRole).includes(role)) {
    res.status(400).json({ message: 'Invalid restaurant role' });
    return;
  }

  // Enforce role hierarchy
  if (!canCreateRole(creator.role, role)) {
    res.status(403).json({ message: `As a ${creator.role}, you cannot create a ${role}` });
    return;
  }

  // Enforce tenant match
  if (tenantId !== restaurant) {
    res.status(403).json({ message: 'Cannot create users for another restaurant' });
    return;
  }

  // Check if email already exists
  if (await UserModel.exists({ email })) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await RestaurantUser.create({
    email,
    passwordHash,
    role,
    restaurant: new mongoose.Types.ObjectId(restaurant),
  });

  res.status(201).json({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    restaurant: newUser.restaurant.toString(),
  });
};
