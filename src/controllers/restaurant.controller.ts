import { Request, Response } from 'express';
import mongoose from 'mongoose';
import RestaurantModel from '../models/Restaurant.js';

/**
 * POST /api/restaurants
 * Superadmin creates a new restaurant
 */
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  const { name, email, address, phone, category, domainSlug, operatingHours } = req.body;

  if (!name || !email || !domainSlug) {
    res.status(400).json({ message: 'name, email, and domainSlug are required' });
    return;
  }

  const exists = await RestaurantModel.findOne({ domainSlug }).exec();
  if (exists) {
    res.status(409).json({ message: 'Slug already in use' });
    return;
  }

  const restaurant = await RestaurantModel.create({
    name,
    email,
    address,
    phone,
    category,
    domainSlug: domainSlug.toLowerCase(),
    operatingHours,
  });

  res.status(201).json(restaurant);
};

/**
 * GET /api/restaurants
 */
export const listRestaurants = async (_req: Request, res: Response): Promise<void> => {
  const list = await RestaurantModel.find().sort({ name: 1 }).exec();
  res.status(200).json(list);
};

/**
 * GET /api/restaurants/:id
 */
export const getRestaurant = async (req: Request, res: Response): Promise<void> => {
  const restaurant = await RestaurantModel.findById(req.params.id).exec();
  if (!restaurant) {
    res.status(404).json({ message: 'Restaurant not found' });
  } else {
    res.status(200).json(restaurant);
  }
};

/**
 * GET /api/restaurants/slug/:slug
 * Public access
 */
export const getRestaurantBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const restaurant = await RestaurantModel.findOne({ domainSlug: slug }).exec();
  if (!restaurant) {
    res.status(404).json({ message: 'Restaurant not found' });
  } else {
    res.status(200).json(restaurant);
  }
};

/**
 * PUT /api/restaurants/:id
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  const updates = req.body;
  const restaurant = await RestaurantModel.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  ).exec();

  if (!restaurant) {
    res.status(404).json({ message: 'Restaurant not found' });
  } else {
    res.status(200).json(restaurant);
  }
};

/**
 * DELETE /api/restaurants/:id
 */
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  const deleted = await RestaurantModel.findByIdAndDelete(req.params.id).exec();
  if (!deleted) {
    res.status(404).json({ message: 'Restaurant not found' });
  } else {
    res.status(200).json({ message: 'Restaurant deleted' });
  }
};
