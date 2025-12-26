import { prisma } from "@/lib/db/prisma";
import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, productId } = await req.json();
  try {
    if (!productId)
      return new NextResponse("Missing required productId", { status: 400 });

    let wishlist;
    const responseHeaders = new Headers();

    if (!userId) {
      const sessionId = `user-${productId}`;
      const expiresDate = addDays(new Date(), 30);

      (await cookies()).set({
        name: "sessionId",
        value: sessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        expires: expiresDate,
      });

      let cookieString = `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresDate.toUTCString()}`;
      if (process.env.NODE_ENV === "production") {
        cookieString += "; Secure";
      }
      wishlist = await prisma.wishlist.create({
        data: {
          sessionId,
        },
      });
      responseHeaders.set("Set-Cookie", cookieString);
    } else {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
        },
      });
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return new NextResponse("Successfully added item to wishlist", {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error adding item to wishlist", error.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
