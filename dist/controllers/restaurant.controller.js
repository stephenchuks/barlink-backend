import RestaurantModel from '../models/Restaurant.js';
export const createRestaurant = async (req, res) => {
    const { name, address, phone, email, category, operatingHours, domainSlug } = req.body;
    const exists = await RestaurantModel.findOne({ domainSlug }).exec();
    if (exists) {
        res.status(409).json({ message: 'domainSlug already in use' });
        return;
    }
    const rest = await RestaurantModel.create({
        name,
        address,
        phone,
        email,
        category,
        operatingHours,
        domainSlug,
    });
    res.status(201).json(rest);
};
export const getRestaurant = async (req, res) => {
    const rest = await RestaurantModel.findById(req.params.id).exec();
    if (!rest) {
        res.status(404).json({ message: 'Restaurant not found' });
        return;
    }
    res.status(200).json(rest);
};
