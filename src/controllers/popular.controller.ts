import { Request, Response } from 'express';
import OrderModel from '../models/Order.js';
import MenuModel from '../models/Menu.js';

/**
 * GET /api/menus/popular
 * Compute popular menu items within this restaurant
 */
export const getPopularItems = async (req: Request, res: Response): Promise<void> => {
  const userRestaurant = req.user?.restaurant;
  if (!userRestaurant) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  // Aggregate order items for this restaurant
  const orders = await OrderModel.find({ restaurant: userRestaurant }).lean().exec();

  const countMap: Record<string, number> = {};

  for (const order of orders) {
  for (const item of order.items) {
    const id = item.menuItem?.toString(); // ✅ fix here
    if (!id) continue;
    countMap[id] = (countMap[id] || 0) + item.quantity;
  }
}


  const sorted = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const itemIds = sorted.map(([id]) => id);
  const itemMap: Record<string, any> = {};

  // Find all menus for this restaurant
  const menus = await MenuModel.find({ restaurant: userRestaurant }).lean().exec();

  for (const menu of menus) {
    for (const sub of menu.subcategories) {
      for (const item of sub.items) {
        const id = item._id.toString();
        if (itemIds.includes(id)) {
          itemMap[id] = { ...item, menuId: menu._id, category: menu.category };
        }
      }
    }
  }

  const result = sorted.map(([id, count]) => ({
    itemId: id,
    count,
    item: itemMap[id] ?? null,
  }));

  res.status(200).json(result);
};
