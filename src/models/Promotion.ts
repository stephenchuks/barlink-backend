import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPromotionItem {
  menuId: Types.ObjectId;
  itemId: Types.ObjectId;
}

export interface IPromotion extends Document {
  restaurant: Types.ObjectId;
  title: string;
  description?: string;
  tag?: string;
  items: IPromotionItem[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionItemSchema = new Schema<IPromotionItem>(
  {
    menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

const PromotionSchema = new Schema<IPromotion>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    tag:         { type: String, default: '' },
    items:       { type: [PromotionItemSchema], default: [] },
    startDate:   { type: Date },
    endDate:     { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
