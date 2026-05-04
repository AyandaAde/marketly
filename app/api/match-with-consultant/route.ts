import { env } from "@/env";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const { inquiry, firstName, lastName, email } = await req.json();
    if (!email || !inquiry || !firstName || !lastName)
      return new NextResponse(
        `Error: Missing requirement ${
          !email
            ? "email"
            : !inquiry
            ? "inquiry"
            : !firstName
            ? "first name"
            : "last name"
        }`,
        {
          status: 400,
          statusText: `Error: Missing requirement ${
            !email
              ? "email"
              : !inquiry
              ? "inquiry"
              : !firstName
              ? "first name"
              : "last name"
          }`,
        }
      );

    const consultants = await prisma.consultant.findMany();

    const categories = consultants.map((consultant) =>
      consultant.expertise.map((expertise) => expertise.title)
    );
    const flatCategories = categories.flat();

    const uniqueCategories = [...new Set(flatCategories)];

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      reasoning: { effort: "high" },
      instructions: `
          You are a semantic categorization assistant.

        Your task: Match the user's inquiry to the most appropriate category from the provided list.
        Focus on meaning, intent, and context, not just keyword matches.
        If the inquiry does not match any category, categorize it as "general inquiry".

        Output format (JSON only, no extra text):
        {
          "category": "<matched category or 'general-consultation'>",
        }
     `,
      input: `
       Categories: ${JSON.stringify(uniqueCategories)}
              Inquiry:
              "${inquiry}"
              `,
    });
    const result = JSON.parse(response.output_text);

    let category = result.category;
    let consultant;
    console.log("Category:", category);

    if (category) {
      consultant = consultants.find((consultant) =>
        consultant.expertise.some((expertise) => expertise.value === category)
      );
    } else {
      consultant = consultants.find((consultant) =>
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
    }

    const mailOptions = {
      from: `${firstName} ${lastName} <${email}>`,
      to: "akinyambo@kondarsoft.com",
      cc: consultant?.email ?? "",
      subject: `Contact Form Submission from ${firstName} ${lastName}`,
      replyto: `${email}`,
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
<h2>New Contact Submission from ${firstName} ${lastName}</h2>
<p><strong>First Name:</strong> ${firstName}</p>
<p><strong>Last Name:</strong> ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <br/>
    <p><strong>Inquiry:</strong>${inquiry}</p>
</div>`,
    };
    await transporter.sendMail(mailOptions);

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