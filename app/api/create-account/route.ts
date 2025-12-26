import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const { values, type } = await req.json();
    delete values.terms;

    try {
        if (type === "business") {
            await prisma.business.create({
                data: {
                    ...values
                }
            })
        }
        else if (type === "shopping") {
            await prisma.individual.create({
                data: {
                    ...values
                }
            })
        }
        return new NextResponse("Account successfully created.", { status: 200 })
    } catch (error: any) {
        console.error("Error creating account", error.message);
        if (error.message.includes("Unique constraint failed on the constraint: `businesses_email_key`") || error.message.includes("Unique constraint failed on the constraint: `individuals_email_key`")) return new NextResponse(error.message, { status: 409 })
        return new NextResponse(error.message, { status: 500 })
    }

}