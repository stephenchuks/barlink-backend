import { Request, Response } from 'express';
import mongoose from 'mongoose';
import RatingModel from '../models/Rating.js';
import MenuModel from '../models/Menu.js';

export const addOrUpdateRating = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const userRestaurant = req.user!.restaurant;

  const { menuId, itemId, rating, comment } = req.body;

  if (!menuId || !itemId || typeof rating !== 'number') {
    res.status(400).json({ message: 'menuId, itemId, and rating are required' });
    return;
  }

  // Validate menu ownership
  const menu = await MenuModel.findById(menuId).exec();
  if (!menu || menu.restaurant.toString() !== userRestaurant) {
    res.status(403).json({ message: 'Forbidden: menu does not belong to your restaurant' });
    return;
  }

  const result = await RatingModel.findOneAndUpdate(
    { userId, itemId },
    {
      userId: new mongoose.Types.ObjectId(userId),
      menuId: new mongoose.Types.ObjectId(menuId),
      itemId: new mongoose.Types.ObjectId(itemId),
      rating,
      comment,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(result);
};

export const getItemRatings = async (req: Request, res: Response): Promise<void> => {
  const itemId = req.params.itemId;
  const ratings = await RatingModel.find({ itemId }).sort('-updatedAt').exec();
  res.status(200).json(ratings);
};

export const getItemRatingSummary = async (req: Request, res: Response): Promise<void> => {
  const itemId = req.params.itemId;

  const stats = await RatingModel.aggregate([
    { $match: { itemId: new mongoose.Types.ObjectId(itemId) } },
    {
      $group: {
        _id: '$itemId',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    res.status(200).json({ avg: 0, count: 0 });
  } else {
    const { avg, count } = stats[0];
    res.status(200).json({ avg, count });
  }
};
