import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAdminPage = url.pathname.startsWith("/admin");
  const isAdminApi = url.pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirect = url.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
