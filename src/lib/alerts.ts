import nodemailer from "nodemailer";

interface AlertOptions {
  to: string;
  monitorName: string;
  monitorUrl: string;
  status: "down" | "up";
  responseTime?: number | null;
  statusCode?: number | null;
  error?: string | null;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getDownEmailTemplate(options: AlertOptions): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alert - Witryna niedostępna</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px 40px;text-align:center;">
              <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:32px;">🔴</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Witryna Niedostępna</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">WebMonitor wykrył problem z Twoją witryną</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              <div style="background:#0f172a;border-radius:8px;padding:24px;margin-bottom:24px;border:1px solid #334155;">
                <h2 style="color:#f1f5f9;margin:0 0 16px;font-size:18px;font-weight:600;">${options.monitorName}</h2>
                <a href="${options.monitorUrl}" style="color:#60a5fa;text-decoration:none;font-size:14px;word-break:break-all;">${options.monitorUrl}</a>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:0 8px 16px 0;" width="50%">
                    <div style="background:#0f172a;border-radius:8px;padding:16px;border:1px solid #334155;">
                      <p style="color:#64748b;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
                      <p style="color:#ef4444;margin:0;font-size:20px;font-weight:700;">NIEDOSTĘPNA</p>
                    </div>
                  </td>
                  <td style="padding:0 0 16px 8px;" width="50%">
                    <div style="background:#0f172a;border-radius:8px;padding:16px;border:1px solid #334155;">
                      <p style="color:#64748b;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Kod odpowiedzi</p>
                      <p style="color:#f1f5f9;margin:0;font-size:20px;font-weight:700;">${options.statusCode || "Brak"}</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${options.error ? `
              <div style="background:#450a0a;border-radius:8px;padding:16px;margin-bottom:24px;border:1px solid #7f1d1d;">
                <p style="color:#fca5a5;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Szczegóły błędu</p>
                <p style="color:#fecaca;margin:0;font-size:13px;font-family:monospace;">${options.error}</p>
              </div>
              ` : ""}

              <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
                Twoja witryna <strong style="color:#f1f5f9;">${options.monitorUrl}</strong> jest niedostępna.
                Sprawdź ją jak najszybciej, aby zminimalizować czas przestoju.
              </p>

              <div style="text-align:center;margin-top:24px;">
                <a href="${process.env.NEXTAUTH_URL}/monitors"
                   style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  Przejdź do panelu
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0;">WebMonitor &copy; ${new Date().getFullYear()} | Automatyczny alert systemowy</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getUpEmailTemplate(options: AlertOptions): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Witryna ponownie dostępna</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px 40px;text-align:center;">
              <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;">
                <span style="font-size:32px;line-height:64px;display:block;">✅</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Witryna Dostępna</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">Twoja witryna działa ponownie prawidłowo</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              <div style="background:#0f172a;border-radius:8px;padding:24px;margin-bottom:24px;border:1px solid #334155;">
                <h2 style="color:#f1f5f9;margin:0 0 16px;font-size:18px;font-weight:600;">${options.monitorName}</h2>
                <a href="${options.monitorUrl}" style="color:#60a5fa;text-decoration:none;font-size:14px;word-break:break-all;">${options.monitorUrl}</a>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:0 8px 16px 0;" width="50%">
                    <div style="background:#0f172a;border-radius:8px;padding:16px;border:1px solid #334155;">
                      <p style="color:#64748b;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
                      <p style="color:#22c55e;margin:0;font-size:20px;font-weight:700;">DOSTĘPNA</p>
                    </div>
                  </td>
                  <td style="padding:0 0 16px 8px;" width="50%">
                    <div style="background:#0f172a;border-radius:8px;padding:16px;border:1px solid #334155;">
                      <p style="color:#64748b;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Czas odpowiedzi</p>
                      <p style="color:#f1f5f9;margin:0;font-size:20px;font-weight:700;">${options.responseTime ? `${options.responseTime} ms` : "—"}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
                Dobra wiadomość! Witryna <strong style="color:#f1f5f9;">${options.monitorUrl}</strong>
                jest ponownie dostępna i odpowiada prawidłowo.
              </p>

              <div style="text-align:center;margin-top:24px;">
                <a href="${process.env.NEXTAUTH_URL}/monitors"
                   style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  Przejdź do panelu
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0;">WebMonitor &copy; ${new Date().getFullYear()} | Automatyczny alert systemowy</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendAlert(options: AlertOptions): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Alert] SMTP not configured, skipping email alert");
    return;
  }

  const transporter = createTransporter();
  const isDown = options.status === "down";

  const subject = isDown
    ? `🔴 ALERT: ${options.monitorName} jest niedostępna`
    : `✅ ODZYSKANO: ${options.monitorName} działa ponownie`;

  const html = isDown ? getDownEmailTemplate(options) : getUpEmailTemplate(options);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject,
      html,
    });
    console.log(`[Alert] Email sent to ${options.to} for monitor ${options.monitorName}`);
  } catch (error) {
    console.error("[Alert] Failed to send email:", error);
  }
}
