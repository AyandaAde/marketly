import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, quantity, userId } = body;
  if (!userId)
    return new NextResponse("Missing required userId", { status: 400 });
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

    return new NextResponse("Successfully added item to cart.", {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error adding item to cart", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
