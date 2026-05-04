import { prisma } from "@/lib/db/prisma";
import { redisClient } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { addDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const { userId } = await auth();
    const ip = req.headers.get("x-forwarded-for");
    const cacheKey = !userId ? `cart-${ip}` : `cart-${userId}`;

    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) return new NextResponse(cachedData, { status: 200 });

        if (userId) {
            const cart = await prisma.cart.findUnique({
                where: {
                    userId
                },
                include: {
                    cartItem: {
                        select: {
                            id: true,
                            quantity: true,
                            product: true
                        },
                    }
                }
            });

            if (cart) {

                const expiryDate = addDays(new Date(), 1);

                await redisClient.set(cacheKey, JSON.stringify(cart?.cartItem), "EX", Math.floor(expiryDate.getTime() / 1000));

                return new NextResponse(JSON.stringify(cart?.cartItem), { status: 200 });
            }
        }

        return new NextResponse(JSON.stringify([]), { status: 200 })
    } catch (error: any) {
        console.error("Error getting cart:", error.message);
        return new NextResponse(error.message, { status: 500 })
    }
}
