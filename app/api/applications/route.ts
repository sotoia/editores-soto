import { NextRequest, NextResponse } from "next/server";
import { ApplicationInputSchema } from "@/lib/schema";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendApplicationConfirmation } from "@/lib/google/gmail";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ApplicationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Ya enviaste una candidatura con este email. Si quieres cambiar algo, escríbeme a pyneal.systems@gmail.com.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire-and-forget email — never block the response if Gmail isn't configured yet.
  sendApplicationConfirmation(parsed.data).catch((e) => {
    console.error("[gmail] confirmation failed:", e instanceof Error ? e.message : e);
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
