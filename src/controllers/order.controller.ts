import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OrderModel, { IOrder } from '../models/Order.js';

/**
 * POST /api/orders
 * Place a new order
 */
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const restaurantId = user.restaurant;

  if (!restaurantId) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  const { items, tableNumber } = req.body as {
    items: IOrder['items'];
    tableNumber?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Order must include at least one item' });
    return;
  }

  const total = items.reduce((sum, item) => {
    const optionsTotal = (item.options || []).reduce((oSum, opt) => oSum + opt.price, 0);
    return sum + (item.price + optionsTotal) * item.quantity;
  }, 0);

  const order = await OrderModel.create({
    restaurant: new mongoose.Types.ObjectId(restaurantId),
    items,
    total,
    placedBy: user.id,
    tableNumber,
    placedAt: new Date(),
  });

  res.status(201).json(order);
};

/**
 * GET /api/orders/restaurant/:id
 * View all orders for a restaurant
 */
export const getOrdersForRestaurant = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const restaurantId = req.params.id;

  if (user.restaurant?.toString() !== restaurantId) {
    res.status(403).json({ message: 'Forbidden: cross-restaurant access' });
    return;
  }

  const orders = await OrderModel.find({ restaurant: restaurantId }).sort({ placedAt: -1 }).exec();
  res.status(200).json(orders);
};

/**
 * GET /api/orders/:id
 * View single order
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderModel.findById(req.params.id).exec();

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  if (order.restaurant.toString() !== req.user?.restaurant?.toString()) {
    res.status(403).json({ message: 'Forbidden: cross-restaurant access' });
    return;
  }

  res.status(200).json(order);
};
