import { NextRequest, NextResponse } from "next/server";
import { UploadIntentSchema } from "@/lib/schema";
import { signUploadUrl } from "@/lib/r2";

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
  const ext = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const key = `submissions/${crypto.randomUUID()}.${ext}`;

  try {
    const signedUrl = await signUploadUrl(key, content_type);
    return NextResponse.json({
      path: key,
      signed_url: signedUrl,
      content_type,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to sign upload URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
