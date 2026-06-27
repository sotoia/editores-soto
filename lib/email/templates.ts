type ApplicationSummary = {
  full_name: string;
  email: string;
  whatsapp?: string | null;
  country: string;
  age: number;
  brief: "elgato" | "autocont";
  price_per_clip: number;
  currency: "EUR" | "USD";
  software: string[];
  experience_years: number;
  experience_text?: string | null;
  work_links: { label: string; url: string }[];
  portfolio_url?: string | null;
};

const BRIEF_LABEL: Record<ApplicationSummary["brief"], string> = {
  elgato: "Elgato Prompter (vídeo de producto)",
  autocont: "AUTOCONT (storytelling de IA)",
};

const SW_LABEL: Record<string, string> = {
  davinci: "DaVinci Resolve",
  aftereffects: "After Effects",
  premiere: "Premiere Pro",
  capcut: "CapCut",
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function applicationReceivedSubject(name: string) {
  return `He recibido tu candidatura, ${name.split(" ")[0] || "buenas"} · SOTO.IA`;
}

export function applicationReceivedText(app: ApplicationSummary) {
  return [
    `¡Hola ${app.full_name.split(" ")[0]}!`,
    ``,
    `He recibido tu candidatura para editor de clips verticales de SOTO.IA.`,
    `Te avisaré con la decisión en las próximas 24 horas.`,
    ``,
    `Resumen de tu propuesta:`,
    `· Brief: ${BRIEF_LABEL[app.brief]}`,
    `· Precio: ${app.price_per_clip} ${app.currency} / clip`,
    `· Software: ${app.software.map((s) => SW_LABEL[s] || s).join(", ")}`,
    `· Experiencia: ${app.experience_years} años`,
    ``,
    `Si no recibes respuesta en 24h, asume que esta vez no fue. Gracias por el tiempo.`,
    ``,
    `Ivan · SOTO.IA`,
  ].join("\n");
}

export function applicationReceivedHtml(app: ApplicationSummary) {
  const firstName = esc(app.full_name.split(" ")[0] || "buenas");
  const brief = BRIEF_LABEL[app.brief];
  const software = app.software.map((s) => SW_LABEL[s] || s).join(", ");

  const rows: [string, string][] = [
    ["Brief elegido", brief],
    ["Precio por clip", `${app.price_per_clip} ${app.currency}`],
    ["Software", software],
    ["Experiencia", `${app.experience_years} años`],
    ["País", app.country],
  ];
  if (app.experience_text) rows.push(["Sobre ti", esc(app.experience_text)]);
  if (app.portfolio_url) rows.push(["Portfolio", `<a href="${esc(app.portfolio_url)}" style="color:#fff;">${esc(app.portfolio_url)}</a>`]);
  if (app.work_links?.length) {
    rows.push([
      "Trabajos",
      app.work_links
        .map((l) => `<a href="${esc(l.url)}" style="color:#fff;">${esc(l.label)}</a>`)
        .join("<br>"),
    ]);
  }

  const rowsHtml = rows
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1f1f1f;color:#9a9a9a;font-size:12px;text-transform:uppercase;letter-spacing:.06em;width:140px;vertical-align:top;">${esc(k)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1f1f1f;color:#ededed;font-size:14px;vertical-align:top;">${v}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ededed;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0c0c0c;border:1px solid #1a1a1a;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:32px 28px 8px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#7a7a7a;">SOTO.IA · casting de editores</div>
                <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;color:#fff;font-weight:600;">¡Hola ${firstName}!</h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.55;color:#cfcfcf;">
                  He recibido tu candidatura para editar clips verticales de SOTO.IA. Te respondo
                  con la decisión en <strong style="color:#fff;">las próximas 24 horas</strong>.
                </p>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:#9a9a9a;">
                  Si la prueba es la ganadora, te escribo para coordinar la primera tanda real
                  (remunerada). Si no, asume que esta vez no fue — gracias igualmente por
                  dedicarle el rato.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#7a7a7a;margin-bottom:10px;">Resumen de tu propuesta</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1a1a1a;border-radius:14px;overflow:hidden;background:#0a0a0a;">
                  ${rowsHtml}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 32px;">
                <p style="margin:0;font-size:13px;color:#7a7a7a;line-height:1.55;">
                  Si necesitas cambiar algún dato, responde a este email y lo ajusto manualmente.
                </p>
                <p style="margin:18px 0 0;font-size:14px;color:#cfcfcf;">
                  Un abrazo,<br>
                  <strong style="color:#fff;">Ivan</strong> · SOTO.IA
                </p>
              </td>
            </tr>
          </table>

          <div style="max-width:560px;color:#5a5a5a;font-size:11px;line-height:1.5;padding:14px 16px;">
            Este email es automático. SOTO.IA · editores-soto.vercel.app
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export type { ApplicationSummary };
