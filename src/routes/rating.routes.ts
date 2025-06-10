
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';

import {
  addOrUpdateRating,
  getItemRatings,
  getItemRatingSummary,
} from '../controllers/rating.controller.js';

const router = Router();

router.post('/', verifyJWT, asyncHandler(addOrUpdateRating));
router.get('/item/:itemId', asyncHandler(getItemRatings));
router.get('/item/:itemId/summary', asyncHandler(getItemRatingSummary));

export default router;
