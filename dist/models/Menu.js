// src/models/Menu.ts
import mongoose, { Schema } from 'mongoose';
const MenuItemOptionSchema = new Schema({
    label: { type: String, required: true },
    price: { type: Number, required: true },
}, { _id: false });
const MenuItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    image: { type: String, default: '' },
    options: { type: [MenuItemOptionSchema], default: [] },
    tags: { type: [String], default: [] },
}, { _id: true });
const SubcategorySchema = new Schema({
    name: { type: String, required: true },
    items: { type: [MenuItemSchema], default: [] },
}, { _id: false });
const MenuCategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
}, { _id: false });
const MenuSchema = new Schema({
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    category: { type: MenuCategorySchema, required: true },
    description: { type: String, default: '' },
    subcategories: { type: [SubcategorySchema], default: [] },
}, { timestamps: true, toJSON: { virtuals: true } });
export default mongoose.model('Menu', MenuSchema);
