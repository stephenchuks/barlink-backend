import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';

const router = Router();

// Allow unauthenticated access — register controller handles superadmin exception
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;
