
import { Router } from 'express';
import { getMe, createUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { RestaurantRole } from '../types/roles.js';

const router = Router();

router.get('/me', verifyJWT, asyncHandler(getMe));

router.post(
  '/',
  verifyJWT,
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(createUser),
);

export default router;
