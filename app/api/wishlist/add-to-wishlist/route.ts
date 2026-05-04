import { prisma } from "@/lib/db/prisma";
import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for");
  const { userId, productId } = await req.json();
  try {
    if (!productId)
      return new NextResponse("Missing required productId", { status: 400 });

    let wishlist;
    let wishlistSessionId;
    const responseHeaders = new Headers();
    let expiresDate: Date | undefined;

    if (!userId) {
      wishlistSessionId = (await cookies()).get("wishlistSessionId")?.value;
      if (!wishlistSessionId) {
        wishlistSessionId = `user-${ip}`;
        if (!ip)
          return new NextResponse("Error: Failed to create sessionId", {
            status: 400,
            statusText: "Error: Failed to create sessionId",
          });

        expiresDate = addDays(new Date(), 30);

        (await cookies()).set({
          name: "wishlistSessionId",
          value: wishlistSessionId,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
          expires: expiresDate,
        });

        let cookieString = `wishlistSessionId=${wishlistSessionId}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresDate.toUTCString()}`;
        if (process.env.NODE_ENV === "production") {
          cookieString += "; Secure";
        }

        responseHeaders.set("Set-Cookie", cookieString);
      }

      wishlist = await prisma.wishlist.create({
        data: {
          sessionId: wishlistSessionId,
        },
      });
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
    const res1 = new NextResponse()

    const response = new NextResponse(
      JSON.stringify({
        message: "Successfully added item to wishlist",
        wishlistSessionId,
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );

    //@ts-ignore
      response.cookies.set({
        name: "wishlistSessionId",
        value: wishlistSessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        expires: expiresDate,
      });

    return response;
  } catch (error: any) {
    console.error("Error adding item to wishlist", error.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
