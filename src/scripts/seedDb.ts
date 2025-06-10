
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import UserModel, {
  PlatformUser,
  RestaurantUser,
} from '../models/User.js';
import RestaurantModel from '../models/Restaurant.js';

async function seed() {
  const uri = process.env.MONGO_URI!;
  await mongoose.connect(uri);
  console.log('🗄️  Connected to MongoDB');

  // 1) Create a restaurant
  const restaurant = await RestaurantModel.create({
    name: 'Acme Bistro',
    address: '123 Main St',
    phone: '555-1234',
    email: 'contact@acmebistro.com',
    category: 'Casual Dining',
    operatingHours: [
      { open: '11:00', close: '22:00' },
    ],
    domainSlug: 'acme-bistro',
  });
  console.log('🍽️  Restaurant created:', restaurant.id);

  // 2) Create a superadmin (platform user)
  const superadmin = await PlatformUser.create({
    email: 'super@platform.com',
    passwordHash: await import('bcrypt').then(b => b.hash('SuperSecret!1', 10)),
    role: 'superadmin',
  });
  console.log('👑 Superadmin created:', superadmin.id);

  // 3) Create an owner for Acme Bistro
  const owner = await RestaurantUser.create({
    email: 'owner@acmebistro.com',
    passwordHash: await import('bcrypt').then(b => b.hash('OwnerPass!2', 10)),
    role: 'owner',
    restaurant: restaurant._id,
  });
  console.log('👤 Owner created:', owner.id);

  // 4) Optional: manager and server
  const manager = await RestaurantUser.create({
    email: 'manager@acmebistro.com',
    passwordHash: await import('bcrypt').then(b => b.hash('ManagerPass!3', 10)),
    role: 'manager',
    restaurant: restaurant._id,
  });
  console.log('👔 Manager created:', manager.id);

  const server = await RestaurantUser.create({
    email: 'server@acmebistro.com',
    passwordHash: await import('bcrypt').then(b => b.hash('ServerPass!4', 10)),
    role: 'server',
    restaurant: restaurant._id,
  });
  console.log('🍽️ Server created:', server.id);

  await mongoose.disconnect();
  console.log('✅ Seeding complete, disconnected from MongoDB');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
