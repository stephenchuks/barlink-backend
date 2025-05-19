// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes       from './routes/auth.routes.js';
import userRoutes       from './routes/user.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import menuRoutes       from './routes/menu.routes.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus',       menuRoutes);

export default app;
