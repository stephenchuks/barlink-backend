
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import OrderModel from '../models/Order.js';
import MenuModel, { IMenuItem } from '../models/Menu.js';

const MONGO_URI = process.env.MONGO_URI!;
const POPULAR_TAG = 'Popular';
const POPULAR_THRESHOLD = 5;

async function tagPopularItems(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const orders = await OrderModel.find({}).lean().exec();
  const frequencyMap: Record<string, number> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const id = item.menuItem.toString();
      frequencyMap[id] = (frequencyMap[id] || 0) + item.quantity;
    }
  }

  const menus = await MenuModel.find({}).exec();

  for (const menu of menus) {
    let updated = false;

    for (const subcat of menu.subcategories) {
      for (const item of subcat.items) {
        const itemId = item._id.toString();
        const count = frequencyMap[itemId] || 0;

        // Ensure item.tags is initialized
        if (!item.tags) item.tags = [];

        const hasTag = item.tags.includes(POPULAR_TAG);
        const shouldBePopular = count >= POPULAR_THRESHOLD;

        if (shouldBePopular && !hasTag) {
          item.tags.push(POPULAR_TAG);
          updated = true;
        } else if (!shouldBePopular && hasTag) {
          item.tags = item.tags.filter((t: string) => t !== POPULAR_TAG);
          updated = true;
        }
      }
    }

    if (updated) {
      await menu.save();
      console.log(`✔️ Updated menu: ${menu.category.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('✅ Done. Popular items tagged.');
}

tagPopularItems().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
