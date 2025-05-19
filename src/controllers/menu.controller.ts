// src/controllers/menu.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import MenuModel, { IMenu, IMenuItem } from '../models/Menu.js';
import { PlatformRole } from '../types/roles.js';

const ensureObjectId = (id: string) => new mongoose.Types.ObjectId(id);

/**
 * POST /api/menus
 */
export const createMenu = async (req: Request, res: Response): Promise<void> => {
  const restaurantId =
    req.user!.role === PlatformRole.Superadmin
      ? req.body.restaurant
      : (req.user as any).restaurant;

  if (!restaurantId) {
    res.status(400).json({ message: 'Restaurant context required' });
    return;
  }

  const { title, description, items } = req.body as {
    title?: string;
    description?: string;
    items?: Partial<IMenuItem>[];
  };

  if (!title) {
    res.status(400).json({ message: 'Menu title is required' });
    return;
  }

  const menu = await MenuModel.create({
    restaurant: ensureObjectId(restaurantId),
    title,
    description,
    items: Array.isArray(items) ? items : [],
  });

  res.status(201).json(menu);
};

/**
 * GET /api/menus
 */
export const listMenus = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = (req.user as any).restaurant!;
  const menus = await MenuModel.find({ restaurant: restaurantId }).exec();
  res.status(200).json(menus);
};

/**
 * GET /api/menus/:id
 */
export const getMenu = async (req: Request, res: Response): Promise<void> => {
  const menu = await MenuModel.findById(req.params.id).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }
  res.status(200).json(menu);
};

/**
 * PUT /api/menus/:id
 */
export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Partial<IMenu>;
  const menu = await MenuModel.findById(req.params.id).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }

  if (updates.title       !== undefined) menu.title       = updates.title;
  if (updates.description !== undefined) menu.description = updates.description;
  if (updates.items       !== undefined) menu.items       = updates.items;

  await menu.save();
  res.status(200).json(menu);
};

/**
 * DELETE /api/menus/:id
 */
export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  const menu = await MenuModel.findByIdAndDelete(req.params.id).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }
  res.status(200).json({ message: 'Menu deleted' });
};

/**
 * POST /api/menus/:menuId/items
 */
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { menuId } = req.params;
  const { name, description, price, available } = req.body as {
    name?: string;
    description?: string;
    price?: number;
    available?: boolean;
  };

  if (!name || price == null) {
    res.status(400).json({ message: 'name and price are required' });
    return;
  }

  const menu = await MenuModel.findById(menuId).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }

  const newItem: IMenuItem = {
    _id: new mongoose.Types.ObjectId(),
    name,
    description,
    price,
    available: available ?? true,
  } as IMenuItem;

  menu.items.push(newItem);
  await menu.save();

  res.status(201).json(menu.items[menu.items.length - 1]);
};

/**
 * PUT /api/menus/:menuId/items/:itemId
 */
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { menuId, itemId } = req.params;
  const updates = req.body as Partial<IMenuItem>;

  const menu = await MenuModel.findById(menuId).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }

  const item = menu.items.find((i: IMenuItem) => i._id.toString() === itemId);
  if (!item) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  if (updates.name        !== undefined) item.name        = updates.name!;
  if (updates.description !== undefined) item.description = updates.description!;
  if (updates.price       !== undefined) item.price       = updates.price!;
  if (updates.available   !== undefined) item.available   = updates.available!;

  await menu.save();
  res.status(200).json(item);
};

/**
 * DELETE /api/menus/:menuId/items/:itemId
 */
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { menuId, itemId } = req.params;
  const menu = await MenuModel.findById(menuId).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }

  const idx = menu.items.findIndex((i: IMenuItem) => i._id.toString() === itemId);
  if (idx === -1) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  menu.items.splice(idx, 1);
  await menu.save();
  res.status(200).json({ message: 'Item deleted' });
};
