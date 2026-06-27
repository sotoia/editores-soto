import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { signDownloadUrl } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();
  const { data: app, error: appErr } = await db
    .from("applications")
    .select("test_video_path")
    .eq("id", params.id)
    .single();
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

  try {
    const url = await signDownloadUrl(app.test_video_path, 3600);
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to sign download URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
