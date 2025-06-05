// src/models/Order.ts
import mongoose, { Schema } from 'mongoose';
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "pending";
    OrderStatus["Served"] = "served";
    OrderStatus["Paid"] = "paid";
})(OrderStatus || (OrderStatus = {}));
const OrderItemSchema = new Schema({
    menuItem: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
}, { _id: false });
const OrderSchema = new Schema({
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Pending,
    },
}, { timestamps: true });
export default mongoose.model('Order', OrderSchema);
