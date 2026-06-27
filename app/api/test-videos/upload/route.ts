import { NextRequest, NextResponse } from "next/server";
import { UploadIntentSchema } from "@/lib/schema";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UploadIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { filename, content_type } = parsed.data;
  const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;

  const db = supabaseAdmin();
  const { data, error } = await db.storage
    .from("test-videos")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    path,
    token: data.token,
    signed_url: data.signedUrl,
    content_type,
  });
}
