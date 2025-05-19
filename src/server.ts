
// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';            // ← add .js extension here
import { connectMongoDB } from './config/mongo.js';
import './config/redis.js';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectMongoDB();
  // redis connection is fire-and-forget in config file

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
