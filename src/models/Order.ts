// src/models/Order.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Possible states of an order
 */
export enum OrderStatus {
  Pending   = 'pending',
  Preparing = 'preparing',
  Served    = 'served',
  Paid      = 'paid',
}

/**
 * An individual line in an order
 */
export interface IOrderItem {
  menuItem: Types.ObjectId;   // ref to a MenuItem _id
  quantity: number;
  price: number;              // client‑passed price (or lookup later)
}

/**
 * The Order document
 */
export interface IOrder extends Document {
  restaurant: Types.ObjectId; // which tenant
  user:       Types.ObjectId; // who placed it
  items:      IOrderItem[];
  total:      number;
  status:     OrderStatus;
  createdAt:  Date;
  updatedAt:  Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'Menu.items', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    user:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items:      { type: [OrderItemSchema], required: true },
    total:      { type: Number, required: true, min: 0 },
    status:     { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Pending },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
