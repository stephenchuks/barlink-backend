import { Router } from 'express';
import { getPopularItems } from '../controllers/popular.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';

const router = Router();

router.get(
  '/',
  verifyJWT,
  asyncHandler(getPopularItems)
);

export default router;
