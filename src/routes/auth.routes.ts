// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// POST /api/auth/register
router.post('/register', asyncHandler(register));

// POST /api/auth/login
router.post('/login', asyncHandler(login));

export default router;
