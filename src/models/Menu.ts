// src/models/Menu.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * A single menu item sub‑document
 */
export interface IMenuItem {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  available: boolean;
}

/**
 * The Menu document
 */
export interface IMenu extends Document {
  restaurant: Types.ObjectId;
  title: string;
  description?: string;
  items: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name:        { type: String, required: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true },
    available:   { type: Boolean, default: true },
  },
  { _id: true }
);

const MenuSchema = new Schema<IMenu>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    title:      { type: String, required: true, trim: true },
    description:{ type: String, default: '' },
    items:      { type: [MenuItemSchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model<IMenu>('Menu', MenuSchema);
