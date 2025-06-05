// src/models/Restaurant.ts
import mongoose, { Schema } from 'mongoose';
const OperatingHoursSchema = new Schema({
    open: { type: String, required: true },
    close: { type: String, required: true },
}, { _id: false });
const RestaurantSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, default: '' },
    operatingHours: { type: [OperatingHoursSchema], default: [] },
    domainSlug: { type: String, required: true, unique: true },
}, { timestamps: true, toJSON: { virtuals: true } });
// Virtual for full URL
RestaurantSchema.virtual('url').get(function () {
    return `${process.env.FRONTEND_URL}/r/${this.domainSlug}`;
});
export default mongoose.model('Restaurant', RestaurantSchema);
