// src/models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { PlatformRole, RestaurantRole, AnyRole } from '../types/roles.js';

const { ObjectId } = mongoose.Types;

// Discriminator key field name
const DISCRIMINATOR_KEY = 'userType';

/**
 * Base interface for all users
 */
export interface IUserBase extends Document {
  email: string;
  passwordHash: string;
  role: AnyRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform‑level user
 */
export interface IPlatformUser extends IUserBase {
  role: PlatformRole;  // must be one of PlatformRole
}

/**
 * Restaurant‑level user
 */
export interface IRestaurantUser extends IUserBase {
  role: RestaurantRole;    // must be one of RestaurantRole
  restaurant: mongoose.Types.ObjectId;  // reference to the tenant
}

/**
 * Base schema shared by all users
 */
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
      ],
    },
  },
  {
    timestamps: true,
    discriminatorKey: DISCRIMINATOR_KEY,
    toJSON: {
      // remove passwordHash and __v
      transform: (_, ret: any) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const UserModel = mongoose.model<IUserBase>(
  'User',
  UserBaseSchema,
);

/**
 * Platform user discriminator (e.g. superadmin, platform_admin)
 */
export const PlatformUser = UserModel.discriminator<IPlatformUser>(
  'PlatformUser',
  new Schema({}, { _id: false }),
);

/**
 * Restaurant user discriminator (owner, manager, supervisor, server)
 */
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
    { _id: false },
  ),
);

export default UserModel;
