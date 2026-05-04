import { prisma } from "@/lib/db/prisma";
import { redisClient } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const ip = req.headers.get("x-forwarded-for");
  const cacheKey = !userId ? `cart-${ip}` : `cart-${userId}`;
  let cartSessionId;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return new NextResponse(cachedData, { status: 200 });

    let cart;

    if (!userId) {
      cartSessionId = (await cookies()).get("cartSessionId")?.value;

      if (!cartSessionId) {
        return new NextResponse("No sessionId found", {
          status: 404,
          statusText: "No sessionId found",
        });
      }

      cart = await prisma.cart.findUnique({
        where: { sessionId: cartSessionId },
        include: {
          cartItem: {
            select: {
              id: true,
              quantity: true,
              product: true,
            },
          },
        },
      });
    } else {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItem: {
            select: {
              id: true,
              quantity: true,
              product: true,
            },
          },
        },
      });
    }

    const expiryDate = addDays(new Date(), 1);

    await redisClient.set(
      cacheKey,
      JSON.stringify(cart?.cartItem ?? []),
      "EX",
      Math.floor(expiryDate.getTime() / 1000)
    );

    const response = new NextResponse(JSON.stringify(cart?.cartItem ?? []), {
      status: 200,
    });

    if (cartSessionId) {
      response.cookies.set({
        name: "cartSessionId",
        value: cartSessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        expires: expiryDate,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Error getting cart:", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
