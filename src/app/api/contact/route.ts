import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Zoho SMTP config
    const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: Number(process.env.ZOHO_SMTP_PORT),
    secure: false, // 587
      auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NovaXmax Contact" <${process.env.ZOHO_SMTP_USER}>`,
      to: "info@novaxmax.com", // where you receive messages
      replyTo: email,
      subject: `📩 ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    await transporter.sendMail({
  from: `"NovaXmax Support" <${process.env.ZOHO_EMAIL}>`,
  to: email,
  subject: "We received your message ✔",
  html: `
    <p>Hi ${name},</p>
    <p>Thanks for contacting NovaXmax. We've received your message and will get back to you shortly.</p>
    <br/>
    <p>NovaXmax Team</p>
  `,
});

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}