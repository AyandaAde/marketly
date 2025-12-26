import { env } from "@/env";
import { sub } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
    const { firstName, lastName, email, subject, message, consultantEmail } =
      await req.json();

    const mailOptions = {
      from: `${firstName} ${lastName} <${email}>`,
      to: "akinyambo@kondarsoft.com",
      cc: consultantEmail,
      subject: `Contact Form Submission from ${firstName} ${lastName}`,
      replyto: `${email}`,
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
<h2>New Contact Submission from ${firstName} ${lastName}</h2>
<p><strong>First Name:</strong> ${firstName}</p>
<p><strong>Last Name:</strong> ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong>${message}</p>
</div>`,
    };
    await transporter.sendMail(mailOptions);

    return new NextResponse("Successfully sent email to consultant", {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error sending message to consultant", { status: 500 });
    return new NextResponse("Failed to send email.", { status: 500 });
  }
}
