import mongoose, { Schema, Document } from 'mongoose';
import { PlatformRole, RestaurantRole, CustomerRole, AnyRole } from '../types/roles.js';

const DISCRIMINATOR_KEY = 'userType';

export interface IUserBase extends Document {
  email: string;
  passwordHash: string;
  role: AnyRole;
  createdAt: Date;
  updatedAt: Date;
  restaurant?: mongoose.Types.ObjectId;
}

export interface IPlatformUser extends IUserBase {
  role: PlatformRole;
}

export interface IRestaurantUser extends IUserBase {
  role: RestaurantRole;
  restaurant: mongoose.Types.ObjectId;
}

// 1️⃣ Here’s the only thing that changed: we now include CustomerRole in our enum
const UserBaseSchema = new Schema<IUserBase>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: [
        ...Object.values(PlatformRole),
        ...Object.values(RestaurantRole),
        ...Object.values(CustomerRole),   // ← customer is now valid
      ],
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: false,
    },
  },
  {
    timestamps: true,
    discriminatorKey: DISCRIMINATOR_KEY,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const UserModel = mongoose.model<IUserBase>('User', UserBaseSchema);

// Platform user discriminator (no extra fields)
export const PlatformUser = UserModel.discriminator<IPlatformUser>(
  'PlatformUser',
  new Schema({}, { _id: false })
);

// Restaurant user discriminator (requires restaurant ID)
export const RestaurantUser = UserModel.discriminator<IRestaurantUser>(
  'RestaurantUser',
  new Schema(
    {
      restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
      },
    },
    { _id: false }
  )
);

export default UserModel;
