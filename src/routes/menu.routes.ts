// src/routes/menu.routes.ts
import { Router } from 'express';
import {
  createMenu,
  listMenus,
  getMenu,
  updateMenu,
  deleteMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menu.controller.js';
import { asyncHandler }    from '../middleware/asyncHandler.js';
import { verifyJWT }       from '../middleware/auth/verifyJWT.js';
import { requireRole }     from '../middleware/auth/requireRole.js';
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

// Create menu item
router.post(
  '/:menuId/items',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(createMenuItem),
);

// Update menu item
router.put(
  '/:menuId/items/:itemId',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(updateMenuItem),
);

// Delete menu item
router.delete(
  '/:menuId/items/:itemId',
  asyncHandler(verifyJWT),
  requireRole({
    allowedRoles: [RestaurantRole.Owner, RestaurantRole.Manager],
    allowSuperadmin: true,
  }),
  asyncHandler(deleteMenuItem),
);

export default router;
