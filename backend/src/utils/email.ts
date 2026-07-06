import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    console.log(`[email:disabled] Would send "${subject}" to ${to}`);
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

export function verificationEmailHtml(name: string, link: string) {
  return `<div style="font-family:Inter,sans-serif;max-width:480px;margin:auto">
    <h2>Verify your email, ${name}</h2>
    <p>Confirm your account for Supply Chain Risk Monitor.</p>
    <a href="${link}" style="display:inline-block;padding:12px 20px;background:#4F6DF5;color:#fff;border-radius:8px;text-decoration:none">Verify email</a>
    <p>This link expires in 24 hours.</p>
  </div>`;
}

export function resetPasswordEmailHtml(name: string, link: string) {
  return `<div style="font-family:Inter,sans-serif;max-width:480px;margin:auto">
    <h2>Reset your password, ${name}</h2>
    <p>We received a request to reset your password.</p>
    <a href="${link}" style="display:inline-block;padding:12px 20px;background:#4F6DF5;color:#fff;border-radius:8px;text-decoration:none">Reset password</a>
    <p>If you didn't request this, you can ignore this email. This link expires in 1 hour.</p>
  </div>`;
}
