import mongoose from 'mongoose';
import OrderModel, { OrderStatus } from '../models/Order.js';
const toObjectId = (id) => new mongoose.Types.ObjectId(id);
/**
 * Customer places an order
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
    const restaurantId = req.user.restaurant;
    const userId = req.user.id;
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: 'Order items are required' });
        return;
    }
    // compute total (price + options)
    const total = items.reduce((sum, item) => {
        const base = item.quantity * item.price;
        const addon = item.options?.reduce((acc, opt) => acc + opt.price, 0) ?? 0;
        return sum + base + (addon * item.quantity);
    }, 0);
    const order = await OrderModel.create({
        restaurant: toObjectId(restaurantId),
        user: toObjectId(userId),
        items: items.map(i => ({
            menuItem: toObjectId(i.menuItem),
            quantity: i.quantity,
            price: i.price,
            options: i.options ?? [],
        })),
        total,
    });
    res.status(201).json(order);
};
/**
 * Customer or staff fetch a single order
 * GET /api/orders/:id
 */
export const getOrder = async (req, res) => {
    const order = await OrderModel.findById(req.params.id)
        .populate('items.menuItem') // for image, name, etc.
        .exec();
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    if (req.user.role === 'customer' && order.user.toString() !== req.user.id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    res.status(200).json(order);
};
/**
 * Staff fetches all orders for their restaurant
 * GET /api/orders/restaurant/:id
 */
export const listRestaurantOrders = async (req, res) => {
    const restaurantId = req.params.id;
    const orders = await OrderModel.find({ restaurant: toObjectId(restaurantId) })
        .populate('items.menuItem') // useful for dashboard
        .sort('-createdAt')
        .exec();
    res.status(200).json(orders);
};
/**
 * Staff updates an order's status
 * PATCH /api/orders/:id
 */
export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
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
