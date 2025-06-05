import { createClient } from 'redis';
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    },
});
redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
await redisClient.connect();
console.log('✅ Redis connected');
export default redisClient;
