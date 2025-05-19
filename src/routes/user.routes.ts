// src/routes/user.routes.ts
import { Router } from 'express';
import { getMe } from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/auth/verifyJWT.js';

const router = Router();

/** Protected route returning the authenticated user */
router.get('/me', verifyJWT, getMe);

export default router;
