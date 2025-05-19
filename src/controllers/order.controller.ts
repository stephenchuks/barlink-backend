// src/controllers/order.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OrderModel, { OrderStatus, IOrderItem } from '../models/Order.js';

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

/**
 * POST /api/orders
 * Body:
 *   {
 *     restaurant?: string,     // optional if user is tied to one
 *     items: [
 *       { menuItem: string, quantity: number, price: number },
 *       …
 *     ]
 *   }
 */
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const restaurant = typeof req.body.restaurant === 'string'
    ? req.body.restaurant
    : (req.user as any).restaurant;
  const userId     = (req.user as any).id;
  const rawItems   = req.body.items as Array<{ menuItem: string; quantity: number; price: number }>;

  if (!restaurant || !Array.isArray(rawItems) || rawItems.length === 0) {
    res.status(400).json({ message: 'restaurant + items required' });
    return;
  }

  // Compute total from passed prices
  let total = 0;
  const items: IOrderItem[] = rawItems.map((it) => {
    total += it.quantity * it.price;
    return {
      menuItem: toObjectId(it.menuItem),
      quantity: it.quantity,
      price:    it.price,
    };
  });

  const order = await OrderModel.create({
    restaurant: toObjectId(restaurant),
    user:       toObjectId(userId),
    items,
    total,
    status:     OrderStatus.Pending,
  });

  res.status(201).json(order);
};

/**
 * GET /api/orders/:id
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderModel.findById(req.params.id).exec();
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.status(200).json(order);
};

/**
 * GET /api/restaurants/:id/orders
 */
export const listRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.params.id;
  const orders = await OrderModel.find({
    restaurant: restaurantId,
    status:     OrderStatus.Pending,
  }).exec();
  res.status(200).json(orders);
};

/**
 * PATCH /api/orders/:id
 * Body: { status: OrderStatus }
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status?: OrderStatus };
  if (!status || !Object.values(OrderStatus).includes(status)) {
    res.status(400).json({ message: 'Valid status required' });
    return;
  }

  const order = await OrderModel.findById(req.params.id).exec();
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  order.status = status;
  await order.save();
  res.status(200).json(order);
};
