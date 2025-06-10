import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OrderModel from '../models/Order.js';
import MenuModel from '../models/Menu.js';
import RatingModel from '../models/Rating.js';

export const getRestaurantAnalytics = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = new mongoose.Types.ObjectId(req.params.id);

  // 1. Order Stats
  const orders = await OrderModel.find({ restaurant: restaurantId }).exec();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // 2. Popular Items (flattened count)
  const itemCountMap: Record<string, number> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const id = item.menuItem.toString();
      itemCountMap[id] = (itemCountMap[id] || 0) + item.quantity;
    }
  }

  const popular = Object.entries(itemCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([itemId, count]) => ({ itemId, count }));

  // 3. Menu Item Count
  const menus = await MenuModel.find({ restaurant: restaurantId }).lean();
  let menuItemCount = 0;
  for (const menu of menus) {
    for (const subcat of menu.subcategories) {
      menuItemCount += subcat.items.length;
    }
  }

  // 4. Average Rating
  const ratingStats = await RatingModel.aggregate([
    { $match: { menuId: restaurantId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avgRating = ratingStats[0]?.avg ?? 0;
  const ratingCount = ratingStats[0]?.count ?? 0;

  res.status(200).json({
    restaurantId: restaurantId.toString(),
    totalOrders,
    totalRevenue,
    menuItemCount,
    averageRating: avgRating,
    ratingCount,
    mostPopularItems: popular,
  });
};