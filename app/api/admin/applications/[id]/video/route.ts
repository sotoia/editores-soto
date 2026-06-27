import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

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

  const { data, error } = await db.storage
    .from("test-videos")
    .createSignedUrl(app.test_video_path, 3600);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
