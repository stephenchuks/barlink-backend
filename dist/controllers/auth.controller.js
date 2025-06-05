import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel, { PlatformUser, RestaurantUser } from '../models/User.js';
import { RestaurantRole } from '../types/roles.js';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    const { email, password, role, restaurant } = req.body;
    if (!email || !password || !role) {
        res.status(400).json({ message: 'Email, password and role are required' });
        return;
    }
    // is it a restaurant‑scoped role?
    const isRestaurantRole = Object.values(RestaurantRole).includes(role);
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
            role: role,
            restaurant: new mongoose.Types.ObjectId(restaurant),
        });
    }
    else {
        // use PlatformUser discriminator
        await PlatformUser.create({
            email,
            passwordHash,
            role: role,
        });
    }
    res.status(201).json({ message: 'User registered successfully' });
};
/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
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
    const payload = {
        userId: user.id,
        role: user.role,
    };
    // include restaurant for restaurant users
    if (user.restaurant) {
        payload.restaurant = user.restaurant.toString();
    }
    const signOptions = { expiresIn: JWT_EXPIRES_IN };
    const token = jwt.sign(payload, JWT_SECRET, signOptions);
    res.status(200).json({ token });
};
