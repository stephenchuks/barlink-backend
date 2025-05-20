// src/controllers/order.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OrderModel, { IOrder, OrderStatus } from '../models/Order.js';

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

/**
 * Customer places an order
 * POST /api/orders
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  // restaurant context from token
  const restaurantId = req.user!.restaurant!;
  const userId       = req.user!.id;

  const { items } = req.body as { items?: Array<{ menuItem: string; quantity: number; price: number }> };

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Order items are required' });
    return;
  }

  // compute total
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const order = await OrderModel.create({
    restaurant: toObjectId(restaurantId),
    user:       toObjectId(userId),
    items:      items.map(i => ({
      menuItem: toObjectId(i.menuItem),
      quantity: i.quantity,
      price:    i.price,
    })),
    total,
  });

  res.status(201).json(order);
};

/**
 * Customer or staff fetch a single order
 * GET /api/orders/:id
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await OrderModel.findById(req.params.id).exec();
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  // If customer, ensure they own it
  if (req.user!.role === 'customer' && order.user.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  res.status(200).json(order);
};

/**
 * Staff fetches all orders for their restaurant
 * GET /api/orders/restaurant/:id
 */
export const listRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.params.id;
  const orders = await OrderModel.find({ restaurant: toObjectId(restaurantId) })
    .sort('-createdAt')
    .exec();
  res.status(200).json(orders);
};

/**
 * Staff updates an order's status
 * PATCH /api/orders/:id
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status?: OrderStatus };

  if (!status || !Object.values(OrderStatus).includes(status)) {
    res.status(400).json({ message: 'Valid status is required' });
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
