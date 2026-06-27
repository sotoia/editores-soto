import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/google/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new NextResponse(`OAuth error: ${error}`, { status: 400 });
  }
  if (!code) {
    return new NextResponse("Missing code", { status: 400 });
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);

    const refresh = tokens.refresh_token;
    if (!refresh) {
      return new NextResponse(
        "No refresh_token returned. Revoke access at https://myaccount.google.com/permissions and try /api/google/oauth again — Google only returns a refresh token on first consent.",
        { status: 400 }
      );
    }

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Refresh token</title>
<style>body{background:#000;color:#ededed;font-family:monospace;padding:32px;max-width:760px;margin:auto;}
code{background:#111;padding:14px;border-radius:8px;display:block;word-break:break-all;font-size:13px;}
h1{font-size:18px;font-weight:600;}p{color:#9a9a9a;}strong{color:#fff;}</style></head>
<body>
  <h1>✅ Refresh token obtenido</h1>
  <p>Copia este valor y pégalo en Vercel como <strong>GOOGLE_REFRESH_TOKEN</strong>:</p>
  <code>${refresh}</code>
  <p>Después no vuelvas a abrir esta URL. Borra este endpoint o protégelo si quieres.</p>
</body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown OAuth error";
    return new NextResponse(`OAuth exchange failed: ${msg}`, { status: 500 });
  }
}
