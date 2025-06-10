import mongoose from 'mongoose';
import MenuModel from '../models/Menu.js';
import { PlatformRole } from '../types/roles.js';
const ensureObjectId = (id) => new mongoose.Types.ObjectId(id);
/**
 * POST /api/menus
 */
export const createMenu = async (req, res) => {
    const restaurantId = req.user.role === PlatformRole.Superadmin
        ? req.body.restaurant
        : req.user.restaurant;
    if (!restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }
    const { category, description, subcategories } = req.body;
    if (!category?.name || !category?.slug) {
        res.status(400).json({ message: 'Category name and slug are required' });
        return;
    }
    if (!Array.isArray(subcategories)) {
        res.status(400).json({ message: 'Subcategories are required' });
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
 * GET /api/menus?slug=xyz
 */
export const listMenus = async (req, res) => {
    const restaurantId = req.user.restaurant;
    const slug = req.query.slug;
    const query = { restaurant: restaurantId };
    if (slug) {
        query['category.slug'] = slug.toLowerCase();
    }
    const menus = await MenuModel.find(query).exec();
    res.status(200).json(menus);
};
/**
 * GET /api/menus/:id
 */
export const getMenu = async (req, res) => {
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
export const updateMenu = async (req, res) => {
    const updates = req.body;
    const menu = await MenuModel.findById(req.params.id).exec();
    if (!menu) {
        res.status(404).json({ message: 'Menu not found' });
        return;
    }
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
export const deleteMenu = async (req, res) => {
    const menu = await MenuModel.findByIdAndDelete(req.params.id).exec();
    if (!menu) {
        res.status(404).json({ message: 'Menu not found' });
        return;
    }
    res.status(200).json({ message: 'Menu deleted' });
};
