import { RequestHandler } from 'express';

/**
 * Wraps an async handler so thrown errors are passed to next().
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
