import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Option for menu items (e.g., with Chicken +$4.00)
 */
export interface IMenuItemOption {
  label: string;
  price: number;
}

/**
 * A single menu item
 */
export interface IMenuItem {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  image?: string;
  options?: IMenuItemOption[];
  tags?: string[];
}

export interface IMenuCategory {
  name: string;
  slug: string;
}

export interface ISubcategory {
  name: string;
  items: IMenuItem[];
}

export interface IMenu extends Document {
  restaurant: Types.ObjectId;
  category: IMenuCategory;
  description?: string;
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemOptionSchema = new Schema<IMenuItemOption>(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name:        { type: String, required: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true },
    available:   { type: Boolean, default: true },
    image:       { type: String, default: '' },
    options:     { type: [MenuItemOptionSchema], default: [] },
    tags:        { type: [String], default: [] },
  },
  { _id: true }
);

const SubcategorySchema = new Schema<ISubcategory>(
  {
    name:  { type: String, required: true },
    items: { type: [MenuItemSchema], default: [] },
  },
  { _id: false }
);

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const MenuSchema = new Schema<IMenu>(
  {
    restaurant:    { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    category:      { type: MenuCategorySchema, required: true },
    description:   { type: String, default: '' },
    subcategories: { type: [SubcategorySchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model<IMenu>('Menu', MenuSchema);
