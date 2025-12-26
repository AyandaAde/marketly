// lib/redis.ts
import { env } from '@/env';
import Redis from 'ioredis';

export const redisClient = new Redis(env.REDIS_URL!); // Make sure to set this in your .env
