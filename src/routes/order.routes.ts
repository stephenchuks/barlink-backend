// src/routes/order.routes.ts
import { Router } from 'express';
import {
  placeOrder,
  getOrder,
  listRestaurantOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { RestaurantRole, PlatformRole } from '../types/roles.js';

const router = Router();

/**
 * Customer‑facing: place a new order
 * POST /api/orders
 */
router.post(
  '/',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [
      RestaurantRole.Owner,
      RestaurantRole.Manager,
      RestaurantRole.Supervisor,
      RestaurantRole.Server,
    ],
    allowSuperadmin: true,
  }),
  asyncHandler(placeOrder),
);

/**
 * Customer‑facing: view your order
 * GET /api/orders/:id
 */
router.get(
  '/:id',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [
      RestaurantRole.Owner,
      RestaurantRole.Manager,
      RestaurantRole.Supervisor,
      RestaurantRole.Server,
    ],
    allowSuperadmin: true,
  }),
  asyncHandler(getOrder),
);

/**
 * Staff‑facing: list pending orders for a restaurant
 * GET /api/restaurants/:id/orders
 */
router.get(
  '/restaurants/:id',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(listRestaurantOrders),
);

/**
 * Mark as served OR paid (we’ll use patch for both)
 * PATCH /api/orders/:id
 */
router.patch(
  '/:id',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(updateOrderStatus),
);

export default router;
