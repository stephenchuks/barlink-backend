
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  listPromotions,
  listActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../controllers/promotion.controller.js';

import { verifyJWT } from '../middleware/auth/verifyJWT.js';
import { requireRole } from '../middleware/auth/requireRole.js';
import { PlatformRole } from '../types/roles.js';

const router = Router();

router.get('/', verifyJWT, requireRole([PlatformRole.Superadmin]), asyncHandler(listPromotions));
router.get('/active', asyncHandler(listActivePromotions));

router.post('/', verifyJWT, requireRole([PlatformRole.Superadmin]), asyncHandler(createPromotion));
router.put('/:id', verifyJWT, requireRole([PlatformRole.Superadmin]), asyncHandler(updatePromotion));
router.delete('/:id', verifyJWT, requireRole([PlatformRole.Superadmin]), asyncHandler(deletePromotion));

export default router;
