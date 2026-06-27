import { google } from "googleapis";

export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

export function getRedirectUri() {
  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (explicit) return explicit;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://editores-soto.vercel.app";
  return `${base.replace(/\/$/, "")}/api/google/callback`;
}

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET");
  }
  return new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());
}

export function getAuthedOAuthClient() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("Missing GOOGLE_REFRESH_TOKEN");
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
