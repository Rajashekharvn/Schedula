import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailParams {
  guestName: string;
  guestEmail: string;
  hostName: string;
  eventTitle: string;
  startTime: Date;
  timezone: string;
  cancelLink: string;
  rescheduleLink: string;
}

function formatDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: timezone,
  }).format(date);
}

export async function sendBookingConfirmationEmail(params: BookingEmailParams) {
  const formattedTime = formatDate(params.startTime, params.timezone);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 0; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px; }
      .body { padding: 40px; }
      .detail { background: #f8fafc; border-radius: 10px; padding: 20px; margin: 24px 0; }
      .detail-row { display: flex; align-items: center; gap: 12px; margin: 10px 0; font-size: 15px; color: #374151; }
      .label { font-weight: 600; color: #6366f1; min-width: 100px; }
      .actions { display: flex; gap: 12px; margin-top: 28px; }
      .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; }
      .btn-primary { background: #6366f1; color: white; }
      .btn-secondary { background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; }
      .footer { padding: 24px 40px; background: #f8fafc; text-align: center; color: #9ca3af; font-size: 13px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
          <p>Your meeting has been scheduled</p>
        </div>
        <div class="body">
          <p style="color:#374151;font-size:15px;">Hi <strong>${params.guestName}</strong>,</p>
          <p style="color:#6b7280;font-size:15px;">Your booking with <strong>${params.hostName}</strong> is confirmed.</p>
          <div class="detail">
            <div class="detail-row"><span class="label">Event</span><span>${params.eventTitle}</span></div>
            <div class="detail-row"><span class="label">When</span><span>${formattedTime}</span></div>
            <div class="detail-row"><span class="label">Host</span><span>${params.hostName}</span></div>
          </div>
          <div class="actions">
            <a href="${params.rescheduleLink}" class="btn btn-secondary">Reschedule</a>
            <a href="${params.cancelLink}" class="btn btn-secondary" style="color:#ef4444;">Cancel</a>
          </div>
        </div>
        <div class="footer">
          Powered by <strong style="color:#6366f1;">Schedula</strong> · The smart scheduling platform
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Schedula <noreply@schedula.app>",
      to: params.guestEmail,
      subject: `Confirmed: ${params.eventTitle} with ${params.hostName}`,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

export async function sendCancellationEmail(params: {
  guestName: string;
  guestEmail: string;
  hostName: string;
  eventTitle: string;
  startTime: Date;
  timezone: string;
}) {
  const formattedTime = formatDate(params.startTime, params.timezone);

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 0; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 40px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
      .body { padding: 40px; }
      .detail { background: #fef2f2; border-radius: 10px; padding: 20px; margin: 24px 0; border: 1px solid #fecaca; }
      .footer { padding: 24px 40px; background: #f8fafc; text-align: center; color: #9ca3af; font-size: 13px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>❌ Booking Cancelled</h1></div>
        <div class="body">
          <p style="color:#374151;font-size:15px;">Hi <strong>${params.guestName}</strong>,</p>
          <p style="color:#6b7280;font-size:15px;">Your booking with <strong>${params.hostName}</strong> has been cancelled.</p>
          <div class="detail">
            <p style="margin:0;font-size:15px;color:#374151;"><strong>${params.eventTitle}</strong></p>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">${formattedTime}</p>
          </div>
        </div>
        <div class="footer">Powered by <strong style="color:#6366f1;">Schedula</strong></div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Schedula <noreply@schedula.app>",
      to: params.guestEmail,
      subject: `Cancelled: ${params.eventTitle} with ${params.hostName}`,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
