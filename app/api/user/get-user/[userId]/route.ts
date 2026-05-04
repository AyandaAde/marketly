import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const user = await prisma.individual.findUnique({
      where: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Error getting user", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
