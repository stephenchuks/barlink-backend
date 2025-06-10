import { Router } from 'express';
import {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  listRestaurants,
  getRestaurantBySlug,
} from '../controllers/restaurant.controller.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { PlatformRole, RestaurantRole } from '../types/roles.js';

const router = Router();

// 🔓 Public route: Get by slug (used by frontend landing)
router.get('/slug/:slug', asyncHandler(getRestaurantBySlug));

// 🔓 Public route: list all
router.get('/', asyncHandler(listRestaurants));

// 🔒 Authenticated routes
router.use(verifyJWT);

// 🔒 Superadmin can create restaurants
router.post(
  '/',
  requireRole({ allowedRoles: [PlatformRole.Superadmin] }),
  asyncHandler(createRestaurant)
);

// 🔒 Owner and Manager can get restaurant
router.get(
  '/:id',
  requireRole({ allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager] }),
  asyncHandler(getRestaurant)
);

router.put(
  '/:id',
  requireRole({ allowedRoles: [RestaurantRole.Owner] }),
  asyncHandler(updateRestaurant)
);

router.delete(
  '/:id',
  requireRole({ allowedRoles: [RestaurantRole.Owner] }),
  asyncHandler(deleteRestaurant)
);

export default router;
