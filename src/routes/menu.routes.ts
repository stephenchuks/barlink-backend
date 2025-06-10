import { Router } from 'express';
import {
  createMenu,
  listMenus,
  getMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menu.controller.js';

import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { RestaurantRole, PlatformRole } from '../types/roles.js';

const router = Router();

// Create a menu
router.post(
  '/',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(createMenu),
);

// List menus
router.get(
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
  asyncHandler(listMenus),
);

// Get one menu
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
  asyncHandler(getMenu),
);

// Update menu
router.put(
  '/:id',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(updateMenu),
);

// Delete menu
router.delete(
  '/:id',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(deleteMenu),
);

export default router;
