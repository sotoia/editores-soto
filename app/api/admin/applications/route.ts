import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .select(
      "id, created_at, full_name, country, email, whatsapp, price_per_clip, currency, software, experience_years, status"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}
