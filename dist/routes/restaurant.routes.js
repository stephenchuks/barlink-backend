// src/routes/restaurant.routes.ts
import { Router } from 'express';
import { createRestaurant, getRestaurant } from '../controllers/restaurant.controller.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { PlatformRole, RestaurantRole } from '../types/roles.js';
const router = Router();
router.post('/', verifyJWT, requireRole([PlatformRole.Superadmin, PlatformRole.PlatformAdmin]), asyncHandler(createRestaurant));
router.get('/:id', verifyJWT, requireRole([RestaurantRole.Owner, RestaurantRole.Manager]), asyncHandler(getRestaurant));
export default router;
