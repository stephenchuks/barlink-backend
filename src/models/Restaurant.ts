import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  category?: string;
  operatingHours?: { open: string; close: string }[];
  domainSlug: string;   // used for URL & QR
  createdAt: Date;
  updatedAt: Date;
}

const OperatingHoursSchema = new Schema<
  { open: string; close: string },
  any,
  { open: string; close: string }
>(
  {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false }
);

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, default: '' },
    operatingHours: { type: [OperatingHoursSchema], default: [] },
    domainSlug: { type: String, required: true, unique: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Virtual for full URL
RestaurantSchema.virtual('url').get(function (this: IRestaurant) {
  return `${process.env.FRONTEND_URL}/r/${this.domainSlug}`;
});

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
