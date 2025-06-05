import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserModel, { RestaurantUser } from '../models/User.js';
import { RestaurantRole } from '../types/roles.js';
/**
 * GET /api/users/me
 */
export const getMe = async (req, res) => {
    const id = req.user.id;
    if (!id) {
        res.status(401).json({ message: 'Unauthenticated' });
        return;
    }
    const user = await UserModel.findById(id).lean().exec();
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    const { passwordHash, ...rest } = user;
    res.status(200).json({ user: rest });
};
/**
 * POST /api/users
 */
export const createUser = async (req, res) => {
    const authId = req.user.id;
    // Load the creator as a RestaurantUser discriminator
    const creator = await RestaurantUser.findById(authId).exec();
    if (!creator) {
        res.status(401).json({ message: 'Unauthenticated or not a restaurant user' });
        return;
    }
    const tenantId = creator.restaurant.toString();
    const { email, password, role, restaurant } = req.body;
    if (!email || !password || !role || !restaurant) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    if (!Object.values(RestaurantRole).includes(role)) {
        res.status(400).json({ message: 'Invalid restaurant role' });
        return;
    }
    if (creator.role === RestaurantRole.Manager && role === RestaurantRole.Owner) {
        res.status(403).json({ message: 'Managers cannot create Owners' });
        return;
    }
    if (tenantId !== restaurant) {
        res.status(403).json({ message: 'Cannot create staff for another restaurant' });
        return;
    }
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
