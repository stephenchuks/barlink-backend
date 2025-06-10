import mongoose, { Schema, Document, Model } from 'mongoose';
import { RestaurantRole } from '../types/roles.js';

export enum OrderStatus {
  Pending = 'pending',
  Served  = 'served',
  Paid    = 'paid',
}

export interface IOrderItemOption {
  label: string;
  price: number;
}

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  options?: IOrderItemOption[];
}

export interface IOrder extends Document {
  restaurant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemOptionSchema = new Schema<IOrderItemOption>(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true },
    price:    { type: Number, required: true },
    options:  { type: [OrderItemOptionSchema], default: [] },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    user:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items:      { type: [OrderItemSchema], required: true },
    total:      { type: Number, required: true },
    status:     {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
