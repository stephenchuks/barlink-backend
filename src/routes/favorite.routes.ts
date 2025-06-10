import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';

import {
  addFavorite,
  removeFavorite,
  listFavorites,
  getFavoriteCount,
} from '../controllers/favorite.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/', asyncHandler(addFavorite));
router.delete('/:itemId', asyncHandler(removeFavorite));
router.get('/', asyncHandler(listFavorites));
router.get('/count/:itemId', asyncHandler(getFavoriteCount));

export default router;
