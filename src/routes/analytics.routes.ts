import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getRestaurantAnalytics } from '../controllers/analytics.controller.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { RestaurantRole, PlatformRole } from '../types/roles.js';
import { requireSameTenant } from '../middleware/auth/requireSameTenant.js';

const router = Router();

router.get(
  '/restaurant/:id',
  verifyJWT,
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: false,
  }),
  requireSameTenant(),
  asyncHandler(getRestaurantAnalytics),
);

export default router;
