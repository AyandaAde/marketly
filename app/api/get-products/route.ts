import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const { searchParams } = url;
    const shipsTo = searchParams.get("shipsTo");
    const currentPage = searchParams.get("currentPage");


    try {
        const products = await prisma.product.findMany({
            where: {
                shipsTo: {
                    has: shipsTo
                },
            },
            take: 8,
            skip: (Number(currentPage) - 1) * 8,
            orderBy: {
                id: "desc"
            },
        });

        return new NextResponse(JSON.stringify(products), { status: 200 });
    } catch (error: any) {
        console.error("Error getting products", error.message);
        return new NextResponse(error.message, { status: 500 })
    }
}