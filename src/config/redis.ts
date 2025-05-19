import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));

await redisClient.connect();
console.log('✅ Redis connected');

export default redisClient;
