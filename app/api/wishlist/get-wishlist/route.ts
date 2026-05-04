import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  let wishlistSessionId;
  if (!userId) {
    wishlistSessionId = (await cookies()).get("wishlistSessionId")?.value;
    if (!wishlistSessionId)
      return new NextResponse("No sessionId found", {
        status: 404,
        statusText: "No sessionId found",
      });
  }
  try {
    let wishlist;
    if (wishlistSessionId) {
      wishlist = await prisma.wishlist.findUnique({
        where: {
          sessionId: wishlistSessionId,
        },
      });
    } else if (userId) {
      wishlist = await prisma.wishlist.findUnique({
        where: {
          userId: userId!,
        },
      });
    }

    if (!wishlist)
      return new NextResponse("Wishlist not found", { status: 404 });

    const response = new NextResponse(
      JSON.stringify({ wishlist, wishlistSessionId }),
      {
        status: 200,
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
    });

    return response;
  } catch (error) {
    console.error("Error getting wishlist", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
