// src/controllers/user.controller.ts
import { RequestHandler } from 'express';

/**
 * GET /api/users/me
 */
export const getMe: RequestHandler = (req, res) => {
  if (!req.user) {
    // Simply send and exit; do not `return res(...)` as a value
    res.status(401).json({ message: 'Unauthenticated' });
    return;
  }
  res.status(200).json({ user: req.user });
};
