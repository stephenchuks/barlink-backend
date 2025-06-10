import { Request, Response } from 'express';
import mongoose from 'mongoose';
import MenuModel, { IMenu, ISubcategory } from '../models/Menu.js';
import { PlatformRole } from '../types/roles.js';

const ensureObjectId = (id: string) => new mongoose.Types.ObjectId(id);

/**
 * POST /api/menus
 */
export const createMenu = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const restaurantId = user.restaurant;

  if (!restaurantId) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  const { category, description, subcategories } = req.body as {
    category?: { name?: string; slug?: string };
    description?: string;
    subcategories?: ISubcategory[];
  };

  if (!category?.name || !category?.slug) {
    res.status(400).json({ message: 'Category name and slug are required' });
    return;
  }

  if (!Array.isArray(subcategories)) {
    res.status(400).json({ message: 'Subcategories must be provided' });
    return;
  }

  const menu = await MenuModel.create({
    restaurant: ensureObjectId(restaurantId),
    category: {
      name: category.name.trim(),
      slug: category.slug.trim().toLowerCase(),
    },
    description,
    subcategories,
  });

  res.status(201).json(menu);
};

/**
 * GET /api/menus?slug=
 */
export const listMenus = async (req: Request, res: Response): Promise<void> => {
  const restaurantId = req.user?.restaurant;

  if (!restaurantId) {
    res.status(403).json({ message: 'Restaurant context required' });
    return;
  }

  const slug = req.query.slug as string | undefined;

  const query: any = { restaurant: restaurantId };
  if (slug) {
    query['category.slug'] = slug.toLowerCase();
  }

  const menus = await MenuModel.find(query).exec();
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

  if (menu.restaurant.toString() !== req.user?.restaurant?.toString()) {
    res.status(403).json({ message: 'Forbidden: cross-restaurant access' });
    return;
  }

  res.status(200).json(menu);
};

/**
 * PUT /api/menus/:id
 */
export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  const menu = await MenuModel.findById(req.params.id).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }

  if (menu.restaurant.toString() !== req.user?.restaurant?.toString()) {
    res.status(403).json({ message: 'Forbidden: cross-restaurant access' });
    return;
  }

  const updates = req.body as Partial<IMenu>;

  if (updates.category?.name !== undefined) {
    menu.category.name = updates.category.name.trim();
  }
  if (updates.category?.slug !== undefined) {
    menu.category.slug = updates.category.slug.trim().toLowerCase();
  }
  if (updates.description !== undefined) {
    menu.description = updates.description;
  }
  if (updates.subcategories !== undefined) {
    menu.subcategories = updates.subcategories;
  }

  await menu.save();
  res.status(200).json(menu);
};

/**
 * DELETE /api/menus/:id
 */
export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  const menu = await MenuModel.findById(req.params.id).exec();
  if (!menu) {
    res.status(404).json({ message: 'Menu not found' });
    return;
  }

  if (menu.restaurant.toString() !== req.user?.restaurant?.toString()) {
    res.status(403).json({ message: 'Forbidden: cross-restaurant access' });
    return;
  }

  await MenuModel.findByIdAndDelete(menu._id);
  res.status(200).json({ message: 'Menu deleted' });
};
