import { prisma } from "@/lib/db/prisma";
import { addDays } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for");
  if (!ip)
    return new NextResponse("Error getting user's IP address", {
      status: 400,
      statusText: "Error getting user's IP address",
    });
  const { userId, productId } = await req.json();
  try {
    if (!productId)
      return new NextResponse("Missing required productId", { status: 400 });

    let wishlist;
    const responseHeaders = new Headers();
    let hashedAndSalted;

    if (!userId) {
      const createSessionId = (ip: string) => {
        let sessionId =
          ip !== "unknown"
            ? ip
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]/g, "")
            : productId
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]/g, "");

        const hash = crypto
          .createHash("sha256")
          .update(sessionId)
          .digest("base64url");

        let salt = crypto.randomBytes(6).toString("base64url");

        sessionId = crypto
          .createHash("sha256")
          .update(hash + salt)
          .digest("base64url");

        hashedAndSalted = sessionId;

        let i = 0;

        sessionId = sessionId.slice(0, 17);

        let numericHash = 0;
        for (let i = 0; i < hash.length; i++) {
          numericHash = (numericHash * 31 + hash.charCodeAt(i)) | 0;
        }

        while (sessionId.length < 20 - 3) {
          const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
          sessionId += chars[Math.abs(numericHash + i * 31) % chars.length];
          i++;
        }

        const timestampPart = Date.now().toString(36).slice(-3);
        sessionId += timestampPart;

        return `${sessionId}${timestampPart}`;
      };
      const sessionId = createSessionId(ip);
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
          sessionExpiry: expiresDate,
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

    return new NextResponse(
      JSON.stringify({
        message: "Successfully added item to wishlist",
        ip,
        hashedAndSalted,
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (error: any) {
    console.error("Error adding item to wishlist", error.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
