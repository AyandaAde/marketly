import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { inquiry, email } = await req.json();

    if (!inquiry) {
      return new NextResponse("Error: Missing requirement inquiry", {
        status: 400,
        statusText: "Error: Missing requirement inquiry",
      });
    }

    if (!email) throw new Error("Internal server error.");

    const consultants = await prisma.consultant.findMany();
    let category: string;
    let consultant = consultants.find((consultant) =>
      consultant.expertise.some((expertise) =>
        inquiry.toLowerCase().includes(expertise.value)
      )
    );

    if (consultant) {
      category =
        consultant.expertise.find((expertise) =>
          inquiry.toLowerCase().includes(expertise.value)
        )?.title ?? "";
    }

    if (!consultant) {
      category = "general-consultation";
      consultant = consultants.find((consultant) =>
        consultant.expertise.some((expertise) => expertise.value === category)
      );
    }

    return new NextResponse(
      JSON.stringify({ consultant, category: category! }),
      {
        status: 200,
        statusText: "Successfully matched with consultant",
      }
    );
  } catch (error) {
    console.error("Error matching with consultant", error);
    return new NextResponse("Internal server error", {
      status: 500,
      statusText: "Internal server error",
    });
  }
}
