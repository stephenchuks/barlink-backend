import { Request, Response } from 'express';
import FavoriteModel from '../models/Favorite.js';
import MenuModel from '../models/Menu.js';
import mongoose from 'mongoose';

/**
 * POST /api/favorites
 * Body: { menuId, itemId }
 */
export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const userRestaurant = req.user!.restaurant;
  const { menuId, itemId } = req.body;

  if (!menuId || !itemId) {
    res.status(400).json({ message: 'menuId and itemId are required' });
    return;
  }

  const menu = await MenuModel.findById(menuId).exec();
  if (!menu || menu.restaurant.toString() !== userRestaurant) {
    res.status(403).json({ message: 'Forbidden: menu does not belong to your restaurant' });
    return;
  }

  try {
    const fav = await FavoriteModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      menuId: new mongoose.Types.ObjectId(menuId),
      itemId: new mongoose.Types.ObjectId(itemId),
    });
    res.status(201).json(fav);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Already favorited' });
    } else {
      throw err;
    }
  }
};

/**
 * DELETE /api/favorites/:itemId
 */
export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const itemId = req.params.itemId;

  const result = await FavoriteModel.findOneAndDelete({
    userId: new mongoose.Types.ObjectId(userId),
    itemId: new mongoose.Types.ObjectId(itemId),
  });

  if (!result) {
    res.status(404).json({ message: 'Favorite not found' });
  } else {
    res.status(200).json({ message: 'Removed from favorites' });
  }
};

/**
 * GET /api/favorites
 */
export const listFavorites = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const favorites = await FavoriteModel.find({ userId }).exec();
  res.status(200).json(favorites);
};

/**
 * GET /api/favorites/count/:itemId
 */
export const getFavoriteCount = async (req: Request, res: Response): Promise<void> => {
  const itemId = req.params.itemId;
  const count = await FavoriteModel.countDocuments({ itemId }).exec();
  res.status(200).json({ itemId, count });
};
