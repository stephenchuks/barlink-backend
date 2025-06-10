
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import MenuModel, { IMenuItem } from '../models/Menu.js';

const MONGO_URI = process.env.MONGO_URI!;
const LOGICAL_TAG = 'Vegetarian';
const AUTO_TAG = `auto:${LOGICAL_TAG}`;
const KEYWORDS = [
  'vegetable', 'veggie', 'tofu', 'mushroom', 'paneer',
  'lentil', 'beans', 'broccoli', 'zucchini', 'cauliflower',
  'chickpea', 'chickpeas',
];

function matchesVegetarian(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some(word => lower.includes(word));
}

function stripAutoTags(tags: string[]): string[] {
  return tags.filter(tag => !tag.startsWith('auto:'));
}

async function autoTagVegetarian(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const menus = await MenuModel.find({}).exec();

  for (const menu of menus) {
    let updated = false;

    for (const subcat of menu.subcategories) {
      for (const item of subcat.items) {
        const source = `${item.name} ${item.description ?? ''}`;
        const detected = matchesVegetarian(source);

        item.tags ??= [];

        const manuallyTagged = item.tags.includes(LOGICAL_TAG);
        const autoTagged = item.tags.includes(AUTO_TAG);

        if (detected && !manuallyTagged && !autoTagged) {
          item.tags.push(AUTO_TAG);
          updated = true;
        } else if (!detected && autoTagged) {
          item.tags = item.tags.filter(tag => tag !== AUTO_TAG);
          updated = true;
        }
      }
    }

    if (updated) {
      await menu.save();
      console.log(`✔️ Auto-tag updated: ${menu.category.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('✅ Auto-tagging completed.');
}

autoTagVegetarian().catch(err => {
  console.error('❌ Auto-tagging failed:', err);
  process.exit(1);
});
