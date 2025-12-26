import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
    const { contactData } = await req.json()
    const { firstName, lastName, email, phone, company, industry, message } = contactData

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false,
        }
    })

    try {
       const mailOptions = {
            from: `${firstName} ${lastName} <${email}>`,
            to: "rslimane@kondarsoft.com",
            subject: `Contact Form Submission from ${firstName} ${lastName}`,
            replyto: `${email}`,
            html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <h2>New Contact Submission from ${firstName} ${lastName}</h2>
    <p><strong>Company Name:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
  ${industry ? `<p><strong>Industry:</strong> ${industry}</p>` : null}
${phone && `<p><strong>Phone Number:</strong> ${phone}</p>`}
        <p><strong>Message:</strong>${message}</p>
  </div>`
        }

        await transporter.sendMail(mailOptions)

        return new NextResponse("Success", { status: 200 })
    } catch (error: any) {
        console.error("Error sending email", error);
        return new NextResponse(error, { status: 500 })
    }
}