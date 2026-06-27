import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (!url.pathname.startsWith("/admin")) return NextResponse.next();
  if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    const redirect = url.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
