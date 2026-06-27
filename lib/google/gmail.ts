import { google } from "googleapis";
import { getAuthedOAuthClient } from "./oauth";
import {
  applicationReceivedHtml,
  applicationReceivedSubject,
  applicationReceivedText,
  type ApplicationSummary,
} from "@/lib/email/templates";

function toBase64Url(input: string) {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRfc2822({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const boundary = `--boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;

  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    html,
    ``,
    `--${boundary}--`,
    ``,
  ];
  return lines.join("\r\n");
}

export async function sendApplicationConfirmation(app: ApplicationSummary) {
  const senderAddress = process.env.GMAIL_SENDER || "pyneal.systems@gmail.com";
  const senderName = process.env.GMAIL_SENDER_NAME || "SOTO.IA Casting";
  const from = `"${senderName}" <${senderAddress}>`;

  const subject = applicationReceivedSubject(app.full_name);
  const text = applicationReceivedText(app);
  const html = applicationReceivedHtml(app);

  const raw = toBase64Url(buildRfc2822({ from, to: app.email, subject, text, html }));

  const auth = getAuthedOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
