// src/models/User.ts
import mongoose, { Schema } from 'mongoose';
import { PlatformRole, RestaurantRole, CustomerRole } from '../types/roles.js';
const DISCRIMINATOR_KEY = 'userType';
// 1️⃣ Here’s the only thing that changed: we now include CustomerRole in our enum
const UserBaseSchema = new Schema({
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
            ...Object.values(CustomerRole), // ← customer is now valid
        ],
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: false,
    },
}, {
    timestamps: true,
    discriminatorKey: DISCRIMINATOR_KEY,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        },
    },
});
const UserModel = mongoose.model('User', UserBaseSchema);
// Platform user discriminator (no extra fields)
export const PlatformUser = UserModel.discriminator('PlatformUser', new Schema({}, { _id: false }));
// Restaurant user discriminator (requires restaurant ID)
export const RestaurantUser = UserModel.discriminator('RestaurantUser', new Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
}, { _id: false }));
export default UserModel;
