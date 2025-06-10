import { Request, Response } from 'express';
import PromotionModel from '../models/Promotion.js';
import mongoose from 'mongoose';

/**
 * GET /api/promotions
 * List all promos for this restaurant
 */
export const listPromotions = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.user?.restaurant;
  if (!restaurantId) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  const promos = await PromotionModel.find({ restaurant: restaurantId }).sort('-createdAt').exec();
  res.status(200).json(promos);
};

/**
 * GET /api/promotions/active
 */
export const listActivePromotions = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.user?.restaurant;
  if (!restaurantId) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  const now = new Date();

  const active = await PromotionModel.find({
    restaurant: restaurantId,
    $or: [
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } },
      { startDate: null, endDate: null },
    ],
  }).sort('-createdAt').exec();

  res.status(200).json(active);
};

/**
 * POST /api/promotions
 */
export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  const { title, description, tag, items, startDate, endDate } = req.body;
  const restaurantId = req.user?.restaurant;

  if (!restaurantId) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  if (!title || !Array.isArray(items)) {
    res.status(400).json({ message: 'Title and items are required' });
    return;
  }

  const parsedItems = items.map((i: any) => ({
    menuId: new mongoose.Types.ObjectId(i.menuId),
    itemId: new mongoose.Types.ObjectId(i.itemId),
  }));

  const promo = await PromotionModel.create({
    restaurant: new mongoose.Types.ObjectId(restaurantId),
    title,
    description,
    tag,
    items: parsedItems,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  res.status(201).json(promo);
};

/**
 * PUT /api/promotions/:id
 */
export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.user?.restaurant;

  const promo = await PromotionModel.findById(req.params.id).exec();
  if (!promo || promo.restaurant.toString() !== restaurantId) {
    res.status(403).json({ message: 'Promotion not found or forbidden' });
    return;
  }

  const { title, description, tag, items, startDate, endDate } = req.body;

  if (title !== undefined) promo.title = title;
  if (description !== undefined) promo.description = description;
  if (tag !== undefined) promo.tag = tag;
  if (startDate !== undefined) promo.startDate = startDate ? new Date(startDate) : undefined;
  if (endDate !== undefined) promo.endDate = endDate ? new Date(endDate) : undefined;
  if (Array.isArray(items)) {
    promo.items = items.map((i: any) => ({
      menuId: new mongoose.Types.ObjectId(i.menuId),
      itemId: new mongoose.Types.ObjectId(i.itemId),
    }));
  }

  await promo.save();
  res.status(200).json(promo);
};

/**
 * DELETE /api/promotions/:id
 */
export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.user?.restaurant;
  const promo = await PromotionModel.findById(req.params.id).exec();

  if (!promo || promo.restaurant.toString() !== restaurantId) {
    res.status(403).json({ message: 'Promotion not found or forbidden' });
    return;
  }

  await PromotionModel.findByIdAndDelete(promo._id);
  res.status(200).json({ message: 'Promotion deleted' });
};
