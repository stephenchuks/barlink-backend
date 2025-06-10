import { Router } from 'express';
import {
  placeOrder,
  getOrderById,
  getOrdersForRestaurant
  // updateOrderStatus // not implemented
} from '../controllers/order.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { RestaurantRole } from '../types/roles.js';

const router = Router();

router.post(
  '/',
  verifyJWT,
  requireRole([RestaurantRole.Server, RestaurantRole.Manager]),
  asyncHandler(placeOrder)
);

router.get(
  '/restaurant/:id',
  verifyJWT,
  requireRole([RestaurantRole.Owner, RestaurantRole.Manager]),
  asyncHandler(getOrdersForRestaurant)
);

router.get(
  '/:id',
  verifyJWT,
  requireRole([RestaurantRole.Owner, RestaurantRole.Manager]),
  asyncHandler(getOrderById)
);

// REMOVE or implement this first
// router.patch(
//   '/:id/status',
//   verifyJWT,
//   requireRole([RestaurantRole.Manager]),
//   asyncHandler(updateOrderStatus)
// );

export default router;
