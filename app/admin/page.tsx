import GlassCard from "@/components/GlassCard";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .select(
      "id, created_at, full_name, country, email, whatsapp, price_per_clip, currency, software, experience_years, status"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto">
        <GlassCard><p className="text-red-400">Error: {error.message}</p></GlassCard>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Candidaturas</h1>
      <GlassCard>
        <ApplicationsTable rows={data || []} />
      </GlassCard>
    </main>
  );
}
