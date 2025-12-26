import { env } from "@/env";
import { prisma } from "@/lib/db/prisma";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix"

export async function POST(req: NextRequest) {
    if (!env.CLERK_SIGNING_SECRET) throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local");

    const wh = new Webhook(env.CLERK_SIGNING_SECRET);

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) return new NextResponse("Error: Missing Svix headers", { status: 400 });

    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;

    } catch (error) {
        console.error("Error: Unable to verify webhook:", error);
        return new NextResponse("Error: Unable to verify webhook", { status: 400 });
    }

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received as webhook with an ID of ${id} and type of ${eventType}`);

    try {
        if (eventType === "user.created") {
            const { email_addresses } = evt.data;
            const email = email_addresses[0]?.email_address || "";

            const businessAccount = await prisma.business.findUnique({
                where: {
                    email,
                }
            });

            if (businessAccount) {
                await prisma.business.update({
                    where: {
                        email,
                    },
                    data: {
                        userId: id,
                    }
                })
            } else {
                const individualAccount = await prisma.individual.findUnique({
                    where: {
                        email
                    }
                })

                if (individualAccount) {
                    await prisma.individual.update({
                        where: {
                            email
                        },
                        data: {
                            userId: id
                        }
                    })
                } else {
                    const client = await clerkClient();
                    await client.users.deleteUser(id!);

                    return NextResponse.redirect(
                        `https://b4c5-2605-6440-300a-6003-00-1780.ngrok-free.app/sign-up`
                    );
                }
            }
            return new NextResponse("Successfully processed webhook", { status: 200 });
        } else if (eventType === "user.deleted") {
            const businessAccount = await prisma.business.findUnique({
                where: {
                    userId: id
                }
            })

            if (businessAccount) {
                await prisma.business.delete({
                    where: {
                        userId: id
                    }
                })
            } else {
                const individualAccount = await prisma.individual.findUnique({
                    where: {
                        userId: id
                    }
                })

                if (individualAccount) await prisma.individual.delete({
                    where: {
                        userId: id
                    }
                })
            }
            return new NextResponse("Webhook successfully processed.", { status: 200 });
        }

        return new NextResponse("Webhook successfully processed", { status: 200 });
    } catch (error: any) {
        console.error("Error handling webhook:", error);
        return new NextResponse(error, { status: 500 })
    }

}