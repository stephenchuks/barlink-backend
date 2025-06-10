import { Request, Response, NextFunction } from 'express';

export function requireSameTenant(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRestaurant = req.user?.restaurant;
    const targetRestaurant = req.params.restaurantId || req.body.restaurant;

    if (!userRestaurant || !targetRestaurant) {
      res.status(400).json({ message: 'Missing restaurant context' });
      return;
    }

    if (userRestaurant.toString() !== targetRestaurant.toString()) {
      res.status(403).json({ message: 'Forbidden: cross-restaurant access' });
      return;
    }

    next();
  };
}
