import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.HELP_EMAIL_USER,
      pass: process.env.HELP_EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"nmoo Support" <${process.env.HELP_EMAIL_USER}>`,
    to: "nmoox2026@gmail.com",
    replyTo: email,
    subject: `[nmoo Help] ${subject}`,
    html: `
      <div dir="rtl" style="font-family: sans-serif; padding: 24px;">
        <h2 style="color: #6c3fc5;">رسالة دعم جديدة من nmoo</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold;">الاسم</td><td>${name}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">البريد</td><td>${email}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">العنوان</td><td>${subject}</td></tr>
        </table>
        <div style="margin-top:16px; padding:16px; background:#f5f5f5; border-radius:8px;">
          <p style="font-weight:bold;">المشكلة:</p>
          <p style="white-space:pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
