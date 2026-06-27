import { NextResponse } from "next/server";
import { GMAIL_SCOPES, getOAuthClient } from "@/lib/google/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });
  return NextResponse.redirect(url);
}
