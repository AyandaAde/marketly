import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { userId, productId } = data;
  try {
    if (!productId)
      return new NextResponse("Missing required productId", { status: 400 });

    let wishlist;

    if (!userId) {
      const sessionId = (await cookies()).get("sessionId")?.value;

      if (!sessionId)
        return new NextResponse("No sessionId found", {
          status: 400,
          statusText: "No sessionId found",
        });
      else
        wishlist = await prisma.wishlist.findUnique({
          where: {
            sessionId,
          },
        });
    } else {
      wishlist = await prisma.wishlist.findUnique({
        where: {
          userId,
        },
      });
    }

    if (!wishlist)
      return new NextResponse("Wishlist not found", {
        status: 404,
        statusText: "Wishlist not found",
      });

    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Successfully deleted item from wishlist",
        userId,
      }),
      {
        status: 200,
        statusText: "Successfully deleted item from wishlist",
      }
    );
  } catch (error: any) {
    console.error("Error adding item to wishlist", error.message);
    return new NextResponse("Internal server error", {
      status: 500,
      statusText: "Internal server error",
    });
  }
}
