import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT),
  secure: false, // 587
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASS,
  },
});

    const brand = {
      orange: "#f97316",
      blue: "#2563eb",
      neutral: "#f3f4f6",
      textDark: "#333",
      textLight: "#777",
      darkBg: "#0d1117",
      darkCard: "#161b22",
    };

    const isBuyer = role === "buyer";
    const primary = isBuyer ? brand.orange : brand.blue;
    const gradientStart = isBuyer ? "#f97316" : "#2563eb";
    const gradientEnd = isBuyer ? "#fb923c" : "#3b82f6";

    const subject = isBuyer
      ? "Welcome to NovaXmax — Let’s Start Shopping!"
      : "Welcome to NovaXmax Seller Hub — Time to Grow Your Business!";

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <title>Welcome to NovaXmax</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: ${brand.neutral};
          color: ${brand.textDark};
          font-family: 'Segoe UI', Arial, sans-serif;
        }
          .banner {
  width: 100%;
  display: block;
  border-radius: 12px;
  margin: 24px 0;
}

.banner-wrapper {
  padding: 0 0 10px;
}

        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        /* ✨ Animated Gradient Header */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .header {
          background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd}, ${isBuyer ? "#facc15" : "#06b6d4"});
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
          padding: 25px 0;
          text-align: center;
        }
        .header img {
          margin-bottom: 8px;
        }
        .header h1 {
          color: #fff;
          font-size: 22px;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .body {
          padding: 30px 40px;
        }
        .body h2 {
          color: ${primary};
          margin-bottom: 10px;
        }
        .body p {
          font-size: 15px;
          line-height: 1.6;
        }
        .cta {
          text-align: center;
          margin: 30px 0;
        }
        .cta a {
          background: ${primary};
          color: #fff !important;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .cta a:hover {
          opacity: 0.9;
        }
        .app-download {
          text-align: center;
          padding: 25px 0;
          background: #fafafa;
          border-top: 1px solid #e5e7eb;
        }
        .app-download p {
          margin-bottom: 15px;
          font-weight: 500;
          color: ${brand.textDark};
        }
        .app-logos img {
          width: 135px;
          margin: 0 8px;
          border-radius: 8px;
        }
        .footer {
          background: ${brand.neutral};
          padding: 25px;
          text-align: center;
          font-size: 13px;
          color: ${brand.textLight};
        }
        .footer-links {
          margin-top: 12px;
        }
        .footer-links a {
          color: ${primary};
          text-decoration: none;
          margin: 0 10px;
          font-weight: 500;
        }
        .social img {
          margin: 0 8px;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 25px 0 15px;
        }
        /* 🌙 Dark mode styles */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: ${brand.darkBg} !important;
            color: #e6edf3 !important;
          }
          .container {
            background-color: ${brand.darkCard} !important;
            box-shadow: none !important;
          }
          .app-download {
            background: ${brand.darkCard} !important;
          }
          .footer {
            background: ${brand.darkBg} !important;
            color: #999 !important;
          }
          .body h2 {
            color: ${isBuyer ? "#fb923c" : "#60a5fa"} !important;
          }
          a {
            color: #fff !important;
          }
          .divider {
            background-color: #30363d !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="https://novaxmax.com/Logo.png" alt="NovaXmax Logo" width="120" />
          <h1>${isBuyer ? "Welcome to NovaXmax!" : "Welcome to NovaXmax Seller Hub!"}</h1>
        </div>

        <!-- Body -->
        <div class="body">
          <h2>Hi ${name || "there"},</h2>
          ${
            isBuyer
              ? `
              <p>We’re thrilled to have you join <b>NovaXmax</b> — your one-stop marketplace for amazing products, great prices, and fast deliveries.</p>
              <p>Start browsing, discover exclusive deals, and experience a smarter way to shop.</p>
<div class="banner-wrapper">
  <img
    src="https://novaxmax.com/buyer-welcome-banner.jpg"
    alt="Discover amazing products on NovaXmax"
    class="banner"
  />
</div>

<p>
  You’re all set! Explore thousands of products, enjoy competitive prices,
  and experience fast, reliable delivery — all in one place.
</p>

            `
              : `
              <p>Welcome to the <b>NovaXmax Seller Hub</b> — the platform designed to help your business grow, connect with customers, and increase sales.</p>
              <p>Get started by adding your first products and building your storefront today.</p>
<div class="banner-wrapper">
  <img
    src="https://novaxmax.com/seller-welcome-banner.jpg"
    alt="Grow your business with NovaXmax Seller Hub"
    class="banner"
  />
</div>

<p>
  Your seller account is ready. NovaXmax gives you the tools to reach more
  customers, manage products easily, and scale your business with confidence.
</p>

            `
          }
          <p style="font-size: 14px; color: #666;">
            Need help? Our team is here for you. Contact us anytime at 
            <a href="mailto:support@novaxmax.com" style="color: ${primary}; text-decoration: none;">support@novaxmax.com</a>.
          </p>
        </div>

        <!-- App Download Section (only for buyers) -->
        ${
          isBuyer
            ? `
            <div class="app-download">
              <p>📱 Get the NovaXmax App for faster shopping</p>
<div class="app-logos">
  <a href="#">
    <img src="https://novaxmax.com/play_store.png" alt="Google Play" width="135" />
  </a>
  <a href="#">
    <img src="https://novaxmax.com/app_store.png" alt="App Store" width="120" />
  </a>
</div>
            </div>
            `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
          <div class="divider"></div>
          <p>Connect with us</p>
          <div class="social">
            <a href="https://facebook.com/novaxmax">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="22" height="22" alt="Facebook" />
            </a>
            <a href="https://instagram.com/novaxmax">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" width="22" height="22" alt="Instagram" />
            </a>
            <a href="https://twitter.com/novaxmax">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="22" height="22" alt="Twitter" />
            </a>
          </div>

          <div class="footer-links">
            <a href="https://novaxmax.com/desc/privacy">Privacy Policy</a> |
            <a href="https://novaxmax.com/desc/terms">Terms of Service</a> |
            <a href="https://novaxmax.com/desc/help/contact">Contact</a>
          </div>

          <p style="font-size: 12px; margin-top: 10px;">
            © ${new Date().getFullYear()} <b>NovaXmax</b>. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"NovaXmax" <${process.env.ZOHO_SMTP_USER}>`,
      to: email,
      replyTo: "support@novaxmax.com",
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}