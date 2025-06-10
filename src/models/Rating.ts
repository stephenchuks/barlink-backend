import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  menuId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

RatingSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', RatingSchema);
