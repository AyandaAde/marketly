import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, quantity, userId } = body;
  let cartSessionId;
  if (!userId) {
    cartSessionId = (await cookies()).get("cartSessionId")?.value;
    if (!cartSessionId)
      return new NextResponse("No sessionId found", {
        status: 404,
        statusText: "No sessionId found",
      });
  }

  if (!productId)
    return new NextResponse("Missing required productId", { status: 400 });
  if (!quantity)
    return new NextResponse("Missing required quantity", { status: 400 });

  try {
    let cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        cartItem: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        select: {
          id: true,
          cartItem: true,
        },
      });
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart!.id,
          productId,
        },
      },
      create: {
        cartId: cart!.id,
        productId: productId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
    });

    const response = new NextResponse(
      JSON.stringify({
        message: "Successfully added item to cart",
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
    });

    return response;
  } catch (error: any) {
    console.error("Error adding item to cart", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
