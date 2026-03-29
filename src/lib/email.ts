import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "EstateOS <noreply@estateos.app>";

export async function sendMagicLinkEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Sign in to EstateOS",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <span style="background: #0f2d5c; color: #fff; font-weight: 800; font-size: 16px; padding: 6px 12px; border-radius: 6px;">EstateOS</span>
        </div>
        <h2 style="color: #0f172a; font-size: 22px; margin: 0 0 8px;">Sign in link</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 24px;">Click the button below to sign in. This link expires in 24 hours and can only be used once.</p>
        <a href="${url}" style="display: inline-block; background: #0f2d5c; color: #fff; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Sign in to EstateOS</a>
        <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendLevyAnnouncementEmail({
  to,
  residentName,
  estateName,
  levyName,
  amountNaira,
  dueDate,
  loginUrl,
}: {
  to: string;
  residentName: string;
  estateName: string;
  levyName: string;
  amountNaira: number;
  dueDate: string;
  loginUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New levy: ${levyName} — ${estateName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <span style="background: #0f2d5c; color: #fff; font-weight: 800; font-size: 16px; padding: 6px 12px; border-radius: 6px;">EstateOS</span>
        </div>
        <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 8px;">New levy announced</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 16px;">Hi ${residentName}, a new levy has been announced for ${estateName}.</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${levyName}</div>
          <div style="color: #0f2d5c; font-size: 22px; font-weight: 800; margin-bottom: 4px;">₦${amountNaira.toLocaleString()}</div>
          <div style="color: #dc2626; font-size: 13px;">Due: ${dueDate}</div>
        </div>
        <a href="${loginUrl}" style="display: inline-block; background: #0f2d5c; color: #fff; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">View &amp; Pay</a>
        <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0;">You can also transfer directly to the estate account and upload your receipt on the portal.</p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail({
  to,
  residentName,
  levyName,
  amountNaira,
  estateName,
}: {
  to: string;
  residentName: string;
  levyName: string;
  amountNaira: number;
  estateName: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment confirmed — ${levyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <span style="background: #0f2d5c; color: #fff; font-weight: 800; font-size: 16px; padding: 6px 12px; border-radius: 6px;">EstateOS</span>
        </div>
        <div style="color: #16a34a; font-size: 32px; margin-bottom: 8px;">✓</div>
        <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 8px;">Payment confirmed</h2>
        <p style="color: #64748b; font-size: 15px; margin: 0 0 16px;">Hi ${residentName}, your payment for ${estateName} has been confirmed.</p>
        <div style="background: #dcfce7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${levyName}</div>
          <div style="color: #16a34a; font-size: 22px; font-weight: 800;">₦${amountNaira.toLocaleString()} paid</div>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is your payment confirmation. Keep it for your records.</p>
      </div>
    `,
  });
}
