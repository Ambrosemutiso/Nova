import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: Number(process.env.ZOHO_SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS,
      },
    });

    const isBuyer = role === "buyer";
    const year = new Date().getFullYear();
    const firstName = (name || "there").split(" ")[0];

    const subject = isBuyer
      ? `${firstName}, your NovaXmax account is ready 🛍️`
      : `${firstName}, your Seller Hub is live — start earning today 🚀`;

    // ── Buyer email ──────────────────────────────────────────────────────────
    const buyerHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Welcome to NovaXmax</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #f0ede8;
      font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }
    .wrapper { width: 100%; background-color: #f0ede8; padding: 40px 16px; }
    .card {
      max-width: 600px; margin: 0 auto;
      background: #ffffff; border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 8px 48px rgba(0,0,0,0.10);
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(145deg, #ff6b1a 0%, #f97316 40%, #fb923c 70%, #fbbf24 100%);
      padding: 48px 40px 56px;
      text-align: center;
      position: relative;
    }
    .hero-logo { margin-bottom: 20px; }
    .hero-logo img { height: 40px; width: auto; }
    .hero-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.35);
      color: #fff;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 5px 14px; border-radius: 100px;
      margin-bottom: 18px;
    }
    .hero h1 {
      color: #ffffff; font-size: 32px; font-weight: 800;
      line-height: 1.15; letter-spacing: -0.02em;
    }
    .hero h1 span { color: #fff3cd; }
    .hero-sub {
      color: rgba(255,255,255,0.85); font-size: 15px;
      margin-top: 10px; line-height: 1.55;
    }
    /* Decorative circles */
    .hero::before {
      content: '';
      position: absolute; top: -40px; right: -40px;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute; bottom: -60px; left: -30px;
      width: 220px; height: 220px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      pointer-events: none;
    }

    /* ── Body ── */
    .body { padding: 40px 40px 32px; }
    .greeting {
      font-size: 22px; font-weight: 800;
      color: #111; margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .greeting span { color: #f97316; }
    .intro {
      font-size: 15px; color: #555; line-height: 1.65;
      margin-bottom: 28px;
    }

    /* ── CTA button ── */
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px; font-weight: 700;
      padding: 16px 40px; border-radius: 100px;
      letter-spacing: 0.01em;
      box-shadow: 0 6px 24px rgba(249,115,22,0.4);
    }

    /* ── Feature cards ── */
    .features { margin: 32px 0; }
    .features-title {
      font-size: 11px; font-weight: 700; color: #aaa;
      text-transform: uppercase; letter-spacing: 0.12em;
      margin-bottom: 16px;
    }
    .feature-grid { width: 100%; border-collapse: separate; border-spacing: 10px; }
    .feature-cell {
      background: #fafafa; border: 1px solid #f0f0f0;
      border-radius: 16px; padding: 18px 16px;
      vertical-align: top; width: 50%;
    }
    .feature-icon {
      font-size: 22px; margin-bottom: 8px; display: block;
    }
    .feature-title {
      font-size: 13px; font-weight: 700; color: #222;
      margin-bottom: 4px;
    }
    .feature-desc {
      font-size: 12px; color: #888; line-height: 1.5;
    }

    /* ── Trust strip ── */
    .trust {
      background: linear-gradient(135deg, #fff7ed, #fffbf5);
      border: 1px solid #fed7aa;
      border-radius: 16px;
      padding: 20px 24px;
      margin: 28px 0;
    }
    .trust-title {
      font-size: 12px; font-weight: 700; color: #c2410c;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 14px;
    }
    .trust-row { width: 100%; border-collapse: collapse; }
    .trust-item { padding: 5px 8px; vertical-align: middle; width: 50%; }
    .trust-check { color: #16a34a; font-size: 14px; font-weight: 700; padding-right: 8px; }
    .trust-text { font-size: 12px; color: #555; font-weight: 500; }

    /* ── App download ── */
    .app-section {
      background: #0d1117; border-radius: 16px;
      padding: 24px; text-align: center; margin: 28px 0;
    }
    .app-section p {
      color: #e6edf3; font-size: 14px; font-weight: 600;
      margin-bottom: 6px;
    }
    .app-section small { color: #8b949e; font-size: 12px; display: block; margin-bottom: 16px; }
    .app-badges img { height: 38px; margin: 0 6px; }

    /* ── Help strip ── */
    .help {
      background: #f9fafb; border-radius: 12px;
      padding: 16px 20px; margin-top: 24px;
      display: flex; align-items: center; gap: 12px;
    }
    .help-icon { font-size: 20px; }
    .help-text { font-size: 13px; color: #555; line-height: 1.5; }
    .help-text a { color: #f97316; text-decoration: none; font-weight: 600; }

    /* ── Footer ── */
    .footer {
      background: #f8f8f8; border-top: 1px solid #eee;
      padding: 28px 40px; text-align: center;
    }
    .social-row { margin-bottom: 16px; }
    .social-link { display: inline-block; margin: 0 6px; }
    .social-link img { width: 28px; height: 28px; border-radius: 50%; }
    .footer-links { margin-bottom: 14px; }
    .footer-links a {
      color: #f97316; text-decoration: none;
      font-size: 12px; font-weight: 600; margin: 0 8px;
    }
    .footer-copy { font-size: 11px; color: #bbb; line-height: 1.6; }

    @media (max-width: 480px) {
      .body, .footer { padding-left: 24px !important; padding-right: 24px !important; }
      .hero { padding: 36px 24px 44px !important; }
      .hero h1 { font-size: 26px !important; }
      .feature-cell { display: block !important; width: 100% !important; margin-bottom: 10px; }
    }
  </style>
</head>
<body>
  <span class="preheader">You're in! Explore deals, track orders, and shop smarter on NovaXmax.</span>

  <div class="wrapper">
    <div class="card">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-logo">
          <img src="https://novaxmax.com/Logo.png" alt="NovaXmax" />
        </div>
        <div class="hero-badge">✦ Account Activated</div>
        <h1>Welcome to <span>NovaXmax</span>,<br/>${firstName}!</h1>
        <p class="hero-sub">Your smarter way to shop across East Africa.<br/>Great prices. Fast delivery. Zero hassle.</p>
      </div>

      <!-- Body -->
      <div class="body">
        <p class="greeting">You're officially in<span>.</span></p>
        <p class="intro">
          Your NovaXmax account is ready to go. Browse thousands of products 
          from verified sellers, unlock exclusive deals, and enjoy a shopping 
          experience built for East Africa.
        </p>

        <!-- CTA -->
        <div class="cta-wrap">
          <a href="https://novaxmax.com" class="cta-btn">Start Shopping Now →</a>
        </div>

        <!-- Feature grid -->
        <div class="features">
          <p class="features-title">What's waiting for you</p>
          <table class="feature-grid" role="presentation">
            <tr>
              <td class="feature-cell">
                <span class="feature-icon">🔥</span>
                <p class="feature-title">Flash Deals Daily</p>
                <p class="feature-desc">Up to 60% off on top products — new deals every day at midnight.</p>
              </td>
              <td class="feature-cell">
                <span class="feature-icon">🚚</span>
                <p class="feature-title">Fast Delivery</p>
                <p class="feature-desc">Same-day delivery in Nairobi. Nationwide shipping with real-time tracking.</p>
              </td>
            </tr>
            <tr>
              <td class="feature-cell">
                <span class="feature-icon">🛡️</span>
                <p class="feature-title">Buyer Protection</p>
                <p class="feature-desc">Every purchase covered. Get a refund if your order isn't as described.</p>
              </td>
              <td class="feature-cell">
                <span class="feature-icon">📦</span>
                <p class="feature-title">Easy Returns</p>
                <p class="feature-desc">Changed your mind? Return within 7 days — no questions asked.</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Trust strip -->
        <div class="trust">
          <p class="trust-title">🏆 Why 50,000+ shoppers trust us</p>
          <table class="trust-row" role="presentation">
            <tr>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Verified sellers only</span></td>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">M-Pesa &amp; card payments</span></td>
            </tr>
            <tr>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Installment plans available</span></td>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">24-hour customer support</span></td>
            </tr>
            <tr>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Nationwide delivery</span></td>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">4.8★ average rating</span></td>
            </tr>
          </table>
        </div>

        <!-- App download -->
        <div class="app-section">
          <p>📱 Shop faster on the NovaXmax App</p>
          <small>Exclusive app-only deals. Push notifications for flash sales.</small>
          <div class="app-badges">
            <a href="#"><img src="https://novaxmax.com/play_store.png" alt="Google Play" /></a>
            <a href="#"><img src="https://novaxmax.com/app_store.png" alt="App Store" /></a>
          </div>
        </div>

        <!-- Help -->
        <div class="help">
          <span class="help-icon">💬</span>
          <p class="help-text">
            Questions? Our team responds in under 1 hour.<br/>
            <a href="mailto:support@novaxmax.com">support@novaxmax.com</a> · 
            <a href="https://novaxmax.com/desc/help/contact">Help Centre</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="social-row">
          <a class="social-link" href="https://facebook.com/novaxmax">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
          </a>
          <a class="social-link" href="https://instagram.com/novaxmax">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" />
          </a>
          <a class="social-link" href="https://twitter.com/novaxmax">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
          </a>
        </div>
        <div class="footer-links">
          <a href="https://novaxmax.com/desc/privacy">Privacy</a>
          <a href="https://novaxmax.com/desc/terms">Terms</a>
          <a href="https://novaxmax.com/desc/help/contact">Contact</a>
          <a href="#">Unsubscribe</a>
        </div>
        <p class="footer-copy">
          © ${year} NovaXmax Limited. All rights reserved.<br/>
          Nairobi, Kenya · novaxmax.com<br/>
          <small style="color:#ddd;">You're receiving this because you signed up at novaxmax.com</small>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

    // ── Seller email ─────────────────────────────────────────────────────────
    const sellerHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Welcome to NovaXmax Seller Hub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0d1117;
      font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }
    .wrapper { width: 100%; background-color: #0d1117; padding: 40px 16px; }
    .card {
      max-width: 600px; margin: 0 auto;
      background: #161b22; border-radius: 24px;
      overflow: hidden;
      border: 1px solid #30363d;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    }

    /* ── Dark hero ── */
    .hero {
      background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%);
      padding: 48px 40px 52px;
      text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; top: -60px; right: -60px;
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(59,130,246,0.15); pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute; bottom: -80px; left: -40px;
      width: 260px; height: 260px; border-radius: 50%;
      background: rgba(37,99,235,0.1); pointer-events: none;
    }
    .hero-logo { margin-bottom: 20px; position: relative; z-index: 1; }
    .hero-logo img { height: 40px; width: auto; filter: brightness(1.1); }
    .hero-badge {
      display: inline-block; position: relative; z-index: 1;
      background: rgba(59,130,246,0.15);
      border: 1px solid rgba(96,165,250,0.4);
      color: #93c5fd; font-size: 11px; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 5px 14px; border-radius: 100px; margin-bottom: 18px;
    }
    .hero h1 {
      color: #f0f6ff; font-size: 30px; font-weight: 800;
      line-height: 1.2; letter-spacing: -0.02em;
      position: relative; z-index: 1;
    }
    .hero h1 span { color: #60a5fa; }
    .hero-sub {
      color: rgba(180,210,255,0.75); font-size: 15px;
      margin-top: 10px; line-height: 1.55;
      position: relative; z-index: 1;
    }

    /* ── Body ── */
    .body { padding: 40px 40px 32px; }
    .greeting { font-size: 22px; font-weight: 800; color: #e6edf3; margin-bottom: 12px; letter-spacing: -0.02em; }
    .greeting span { color: #60a5fa; }
    .intro { font-size: 15px; color: #8b949e; line-height: 1.65; margin-bottom: 28px; }

    /* ── Stats strip ── */
    .stats {
      background: linear-gradient(135deg, #0d1117, #161b22);
      border: 1px solid #30363d; border-radius: 16px;
      padding: 24px; margin-bottom: 28px;
      text-align: center;
    }
    .stats-title { font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 18px; }
    .stats-grid { width: 100%; border-collapse: collapse; }
    .stat-cell { padding: 0 12px; text-align: center; border-right: 1px solid #30363d; }
    .stat-cell:last-child { border-right: none; }
    .stat-number { font-size: 24px; font-weight: 800; color: #60a5fa; letter-spacing: -0.03em; display: block; }
    .stat-label { font-size: 11px; color: #6e7681; margin-top: 3px; display: block; }

    /* ── CTA ── */
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff !important; text-decoration: none;
      font-size: 15px; font-weight: 700;
      padding: 16px 40px; border-radius: 100px;
      letter-spacing: 0.01em;
      box-shadow: 0 6px 28px rgba(37,99,235,0.45);
    }

    /* ── Steps ── */
    .steps { margin: 28px 0; }
    .steps-title { font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; }
    .step-item {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 0; border-bottom: 1px solid #21262d;
    }
    .step-item:last-child { border-bottom: none; }
    .step-num {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #fff; font-size: 11px; font-weight: 800;
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
    }
    .step-body {}
    .step-title { font-size: 14px; font-weight: 700; color: #e6edf3; margin-bottom: 3px; }
    .step-desc { font-size: 12px; color: #6e7681; line-height: 1.5; }

    /* ── Feature cards ── */
    .features { margin: 28px 0; }
    .features-title { font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; }
    .feature-grid { width: 100%; border-collapse: separate; border-spacing: 10px; }
    .feature-cell {
      background: #0d1117; border: 1px solid #21262d;
      border-radius: 14px; padding: 16px; vertical-align: top; width: 50%;
    }
    .feature-icon { font-size: 20px; margin-bottom: 8px; display: block; }
    .feature-title { font-size: 13px; font-weight: 700; color: #e6edf3; margin-bottom: 4px; }
    .feature-desc { font-size: 12px; color: #6e7681; line-height: 1.5; }

    /* ── Trust strip ── */
    .trust {
      background: linear-gradient(135deg, #0f2744, #0d1f3c);
      border: 1px solid #1e3a5f; border-radius: 16px;
      padding: 20px 24px; margin: 28px 0;
    }
    .trust-title { font-size: 12px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
    .trust-row { width: 100%; border-collapse: collapse; }
    .trust-item { padding: 5px 8px; vertical-align: middle; width: 50%; }
    .trust-check { color: #34d399; font-size: 14px; font-weight: 700; padding-right: 8px; }
    .trust-text { font-size: 12px; color: #8b949e; font-weight: 500; }

    /* ── Help ── */
    .help {
      background: #0d1117; border: 1px solid #21262d;
      border-radius: 12px; padding: 16px 20px; margin-top: 24px;
    }
    .help-text { font-size: 13px; color: #8b949e; line-height: 1.6; }
    .help-text a { color: #60a5fa; text-decoration: none; font-weight: 600; }
    .help-text strong { color: #e6edf3; }

    /* ── Footer ── */
    .footer {
      background: #0d1117; border-top: 1px solid #21262d;
      padding: 28px 40px; text-align: center;
    }
    .social-row { margin-bottom: 16px; }
    .social-link { display: inline-block; margin: 0 6px; }
    .social-link img { width: 28px; height: 28px; border-radius: 50%; filter: brightness(0.8); }
    .footer-links { margin-bottom: 14px; }
    .footer-links a { color: #60a5fa; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 8px; }
    .footer-copy { font-size: 11px; color: #484f58; line-height: 1.6; }

    @media (max-width: 480px) {
      .body, .footer { padding-left: 24px !important; padding-right: 24px !important; }
      .hero { padding: 32px 24px 40px !important; }
      .hero h1 { font-size: 24px !important; }
      .stat-cell { padding: 0 8px !important; }
      .stat-number { font-size: 18px !important; }
      .feature-cell { display: block !important; width: 100% !important; margin-bottom: 10px; }
    }
  </style>
</head>
<body>
  <span class="preheader">Your NovaXmax Seller Hub is live — add products and start earning today.</span>

  <div class="wrapper">
    <div class="card">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-logo">
          <img src="https://novaxmax.com/Logo.png" alt="NovaXmax" />
        </div>
        <div class="hero-badge">🚀 Seller Account Active</div>
        <h1>Your <span>Seller Hub</span> is live,<br/>${firstName}!</h1>
        <p class="hero-sub">Join thousands of sellers growing their business<br/>across East Africa on NovaXmax.</p>
      </div>

      <!-- Body -->
      <div class="body">
        <p class="greeting">Welcome to the hub<span>.</span></p>
        <p class="intro">
          You're now part of a seller community reaching customers in Kenya, Uganda, Tanzania and beyond.
          List your products, set your prices, and let NovaXmax handle the discovery.
        </p>

        <!-- Platform stats -->
        <div class="stats">
          <p class="stats-title">📊 Why sellers choose NovaXmax</p>
          <table class="stats-grid" role="presentation">
            <tr>
              <td class="stat-cell">
                <span class="stat-number">50K+</span>
                <span class="stat-label">Active buyers</span>
              </td>
              <td class="stat-cell">
                <span class="stat-number">8</span>
                <span class="stat-label">Countries reached</span>
              </td>
              <td class="stat-cell">
                <span class="stat-number">4.8★</span>
                <span class="stat-label">Seller satisfaction</span>
              </td>
              <td class="stat-cell">
                <span class="stat-number">24h</span>
                <span class="stat-label">Support response</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div class="cta-wrap">
          <a href="https://novaxmax.com/seller/dashboard" class="cta-btn">Open Seller Dashboard →</a>
        </div>

        <!-- Getting started steps -->
        <div class="steps">
          <p class="steps-title">⚡ Get selling in 3 steps</p>
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-body">
              <p class="step-title">Add your first product</p>
              <p class="step-desc">Upload photos, set your price, and go live in minutes. Our listing tool is built for speed.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-body">
              <p class="step-title">Get discovered by buyers</p>
              <p class="step-desc">NovaXmax promotes new products in search, trending feeds, and category highlights automatically.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-body">
              <p class="step-title">Receive payments instantly</p>
              <p class="step-desc">Payments settle to M-Pesa or your bank within 24–48 hours after order delivery confirmation.</p>
            </div>
          </div>
        </div>

        <!-- Seller features -->
        <div class="features">
          <p class="features-title">Tools built for your growth</p>
          <table class="feature-grid" role="presentation">
            <tr>
              <td class="feature-cell">
                <span class="feature-icon">📊</span>
                <p class="feature-title">Sales Analytics</p>
                <p class="feature-desc">Real-time dashboard showing views, conversions, and revenue trends.</p>
              </td>
              <td class="feature-cell">
                <span class="feature-icon">💳</span>
                <p class="feature-title">Installment Payments</p>
                <p class="feature-desc">Offer pay-later options to boost conversions on high-ticket items.</p>
              </td>
            </tr>
            <tr>
              <td class="feature-cell">
                <span class="feature-icon">📦</span>
                <p class="feature-title">Order Management</p>
                <p class="feature-desc">Track every order from placement to delivery in one clean view.</p>
              </td>
              <td class="feature-cell">
                <span class="feature-icon">🎯</span>
                <p class="feature-title">Promoted Listings</p>
                <p class="feature-desc">Boost visibility during flash sales and seasonal campaigns.</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Trust strip -->
        <div class="trust">
          <p class="trust-title">✦ What sellers get on NovaXmax</p>
          <table class="trust-row" role="presentation">
            <tr>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Zero listing fees</span></td>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Dedicated seller support</span></td>
            </tr>
            <tr>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Fraud protection built-in</span></td>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">M-Pesa &amp; bank payouts</span></td>
            </tr>
            <tr>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">50,000+ ready buyers</span></td>
              <td class="trust-item"><span class="trust-check">✓</span><span class="trust-text">Regional &amp; local reach</span></td>
            </tr>
          </table>
        </div>

        <!-- Help -->
        <div class="help">
          <p class="help-text">
            <strong>Need a hand getting started?</strong> Our seller onboarding team responds in under 1 hour.<br/>
            <a href="mailto:sellers@novaxmax.com">sellers@novaxmax.com</a> ·
            <a href="https://novaxmax.com/desc/help/sellers">Seller Help Centre</a> ·
            <a href="https://novaxmax.com/seller/dashboard">Dashboard</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="social-row">
          <a class="social-link" href="https://facebook.com/novaxmax">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
          </a>
          <a class="social-link" href="https://instagram.com/novaxmax">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" />
          </a>
          <a class="social-link" href="https://twitter.com/novaxmax">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
          </a>
        </div>
        <div class="footer-links">
          <a href="https://novaxmax.com/desc/privacy">Privacy</a>
          <a href="https://novaxmax.com/desc/terms">Terms</a>
          <a href="https://novaxmax.com/desc/help/contact">Contact</a>
          <a href="#">Unsubscribe</a>
        </div>
        <p class="footer-copy">
          © ${year} NovaXmax Limited. All rights reserved.<br/>
          Nairobi, Kenya · novaxmax.com<br/>
          <small style="color:#3d444d;">You're receiving this because you created a seller account on novaxmax.com</small>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

    const html = isBuyer ? buyerHtml : sellerHtml;

    await transporter.sendMail({
      from: `"NovaXmax" <${process.env.ZOHO_SMTP_USER}>`,
      to: email,
      replyTo: isBuyer ? "support@novaxmax.com" : "sellers@novaxmax.com",
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}