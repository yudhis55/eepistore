import "dotenv/config";
import { createTransport } from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST ?? "localhost";
  const port = Number(process.env.SMTP_PORT ?? 1025);

  return createTransport({
    host,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = getTransport();
  const from = process.env.SMTP_FROM ?? "noreply@eepistore.local";

  await transport.sendMail({ from, to, subject, html });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0A2A5E;">Reset Password EEPISTORE</h2>
      <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
      <p>Klik tautan berikut untuk mengatur ulang password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #0A2A5E; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #6B7280; font-size: 14px;">
        Jika Anda tidak meminta reset password, abaikan email ini.
        Tautan ini akan kedaluwarsa dalam 1 jam.
      </p>
    </div>
  `;

  await sendEmail(to, "Reset Password - EEPISTORE", html);
}
