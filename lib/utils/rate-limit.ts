import { NextRequest } from "next/server";
import { redisClient } from "../redis";

export async function rateLimit(req: NextRequest, limit: number, windowInSeconds: number) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const url = new URL(req.url);
    const key = `rate-limit:-${url.pathname}-${ip}`;
    const currentUsage = await redisClient.incr(key);

    if (currentUsage === 1) {
        await redisClient.expire(key, windowInSeconds);
    }

    const remaining = Math.max(0, limit - currentUsage);
    const isRateLimitReached = currentUsage > limit;
    
    return {
        remaining,
        isRateLimitReached,
    };
}

