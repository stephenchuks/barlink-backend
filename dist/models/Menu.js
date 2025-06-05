// src/models/Menu.ts
import mongoose, { Schema } from 'mongoose';
const MenuItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
}, { _id: true });
const MenuSchema = new Schema({
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    items: { type: [MenuItemSchema], default: [] },
}, { timestamps: true, toJSON: { virtuals: true } });
export default mongoose.model('Menu', MenuSchema);
