import { prisma } from "@/lib/db/prisma";
import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, productId } = await req.json();
  try {
    if (!productId)
      return new NextResponse("Missing required productId", {
        status: 400,
        statusText: "Missing required productId",
      });

    let wishlist;
    const responseHeaders = new Headers();

    if (!userId) {
      let sessionId =
        (await cookies()).get("sessionId")?.value || `user-${productId}`;
      if (!sessionId) {
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
        responseHeaders.set("Set-Cookie", cookieString);
      }
      wishlist = await prisma.wishlist.findUnique({
        where: {
          sessionId,
        },
      });
      if (!wishlist)
        wishlist = await prisma.wishlist.create({
          data: {
            sessionId,
          },
        });
    } else {
      wishlist = await prisma.wishlist.findUnique({
        where: {
          userId,
        },
      });
      if (!wishlist)
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
      statusText: "Successfully added item to wishlist",
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error adding item to wishlist", error.message);
    return new NextResponse("Internal server error", {
      status: 500,
      statusText: "Internal server error",
    });
  }
}
