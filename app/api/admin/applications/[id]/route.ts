import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { StatusUpdateSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = StatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .update(parsed.data)
    .eq("id", params.id)
    .select("id, status, admin_notes")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${params.id}`);

  return NextResponse.json(
    { ok: true, id: data.id, status: data.status, admin_notes: data.admin_notes },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
