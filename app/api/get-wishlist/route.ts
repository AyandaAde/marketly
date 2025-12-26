import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  let sessionId;
  if (!userId) {
    sessionId = (await cookies()).get("sessionId")?.value;
    if (!sessionId)
      return new NextResponse("No sessionId found", { status: 400 });
  }
  try {
    let wishlist;
    if (sessionId) {
      wishlist = await prisma.wishlist.findUnique({
        where: {
          sessionId,
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
    return new NextResponse(JSON.stringify(wishlist), { status: 200 });
  } catch (error) {
    console.error("Error getting wishlist", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
