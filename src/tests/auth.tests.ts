// src/tests/auth.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';                 // resolves to src/app.ts
import UserModel from '../models/User';   // resolves to src/models/User.ts

const TEST_DB = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/barlink_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.db!.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth & Me Endpoint', () => {
  const email = 'owner@example.com';
  const password = 'StrongPass!23';
  const role = 'owner';
  let token: string;

  it('POST /api/auth/register → 201', async () => {
    const restaurantId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password, role, restaurant: restaurantId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');

    const user = await UserModel.findOne({ email }).exec();
    expect(user).not.toBeNull();
    expect(user!.email).toBe(email);
  });

  it('POST /api/auth/login → 200 + token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('GET /api/users/me → 200 + user info', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({ role, id: expect.any(String) });
  });

  it('GET /api/users/me without token → 401', async () => {
    const res = await request(app).get('/api/users/me');
    // our middleware returns { message: ... }, not { error: ... }
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
