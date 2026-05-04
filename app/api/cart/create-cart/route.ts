import { prisma } from "@/lib/db/prisma";
import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for");
  const body = await req.json();
  const { productId, quantity, userId } = body;
  let cartSessionId;
  let expiryDate;
  let cart;

  if (!productId)
    return new NextResponse("Missing required productId", { status: 400 });
  if (!quantity)
    return new NextResponse("Missing required quantity", { status: 400 });

  try {
    if (!userId) {
      cartSessionId = (await cookies()).get("cartSessionId")?.value;
      if (!cartSessionId) {
        cartSessionId = `user-${ip}`;
        if (!ip)
          return new NextResponse("Error: Failed to create sessionId", {
            status: 400,
            statusText: "Error: Failed to create sessionId",
          });
        expiryDate = addDays(new Date(), 30);
      }

      cart = await prisma.cart.create({
        data: {
          sessionId: cartSessionId,
        },
      });
    } else
      cart = await prisma.cart.create({
        data: {
          userId,
        },
      });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    const response = new NextResponse(
      JSON.stringify({
        message: "Successfully cerated cart",
        cartSessionId,
      }),
      {
        status: 200,
      }
    );

    //@ts-ignore
    response.cookies.set({
      name: "cartSessionId",
      value: cartSessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      expires: expiryDate,
    });

    return response;
  } catch (error: any) {
    console.error("Error adding item to cart", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
