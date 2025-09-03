// app/api/admin/send-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// --- Example: your 5 email templates ---
const emailTemplates: Record<string, (name: string) => { subject: string; html: string }> = {
  template1: (name: string) => ({
    subject: "Welcome to Our Marketplace!",
    html: `<h2>Hello ${name},</h2>
           <p>We’re excited to have you on board. Explore our marketplace and start selling or buying today!</p>
           <p>Best regards,<br/>The Marketplace Team</p>`
  }),
  template2: (name: string) => ({
    subject: "Account Update Notification",
    html: `<h2>Hello ${name},</h2>
           <p>This is a quick update regarding your account. Please login to your dashboard for more details.</p>
           <p>Thank you,<br/>Marketplace Support</p>`
  }),
  template3: (name: string) => ({
    subject: "Action Required: Verify Your Email",
    html: `<h2>Hi ${name},</h2>
           <p>Please verify your email address by clicking the button below.</p>
           <a href="#" style="background:#4F46E5;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Verify Email</a>`
  }),
  template4: (name: string) => ({
    subject: "Congratulations! You’ve Achieved a New Milestone",
    html: `<h2>Hello ${name},</h2>
           <p>Congratulations on reaching a new milestone in our marketplace. Keep up the great work!</p>
           <p>- Marketplace Team</p>`
  }),
  template5: (name: string) => ({
    subject: "Important Notice from Marketplace",
    html: `<h2>Dear ${name},</h2>
           <p>This is an important notice regarding your account. Please read carefully and contact us if you have any questions.</p>`
  }),
};

// --- Email sender function ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // your Gmail or SMTP email
    pass: process.env.SMTP_PASS, // app password or SMTP password
  },
});

export async function POST(req: Request) {
  try {
    const { recipientEmail, recipientName, templateKey } = await req.json();

    if (!recipientEmail || !recipientName || !templateKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const template = emailTemplates[templateKey];
    if (!template) {
      return NextResponse.json({ error: "Invalid template selected" }, { status: 400 });
    }

    const { subject, html } = template(recipientName);

    await transporter.sendMail({
      from: `"Marketplace Admin" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject,
      html,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
