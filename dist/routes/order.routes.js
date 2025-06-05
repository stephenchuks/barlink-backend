// src/routes/order.routes.ts
import { Router } from 'express';
import { createOrder, getOrder, listRestaurantOrders, updateOrderStatus, } from '../controllers/order.controller.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { CustomerRole, RestaurantRole } from '../types/roles.js';
const router = Router();
// Customer places an order
router.post('/', verifyJWT, requireRole({ allowedRoles: [CustomerRole.Customer], allowSuperadmin: false }), createOrder);
// Customer checks own order
router.get('/:id', verifyJWT, requireRole({ allowedRoles: [CustomerRole.Customer], allowSuperadmin: false }), getOrder);
// Staff fetches all restaurant orders
router.get('/restaurant/:id', verifyJWT, requireRole({
    allowedRoles: [
        RestaurantRole.Owner,
        RestaurantRole.Manager,
        RestaurantRole.Supervisor,
        RestaurantRole.Server,
    ],
    allowSuperadmin: true,
}), listRestaurantOrders);
// Staff updates order status
router.patch('/:id', verifyJWT, requireRole({
    allowedRoles: [
        RestaurantRole.Owner,
        RestaurantRole.Manager,
        RestaurantRole.Supervisor,
        RestaurantRole.Server,
    ],
    allowSuperadmin: true,
}), updateOrderStatus);
export default router;
