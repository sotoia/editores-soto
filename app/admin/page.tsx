import AdminSidebar from "@/components/admin/AdminSidebar";
import ApplicationCard from "@/components/admin/ApplicationCard";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Search = {
  status?: string;
  brief?: string;
};

export default async function AdminHome({ searchParams }: { searchParams: Search }) {
  const db = supabaseAdmin();

  let query = db
    .from("applications")
    .select(
      "id, created_at, full_name, country, email, price_per_clip, currency, software, experience_years, status, brief"
    )
    .order("created_at", { ascending: false });

  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.brief) query = query.eq("brief", searchParams.brief);

  const { data: rows, error } = await query;

  const { data: countsRaw } = await db.from("applications").select("status");

  const counts = {
    total: countsRaw?.length || 0,
    pending: countsRaw?.filter((r) => r.status === "pending").length || 0,
    shortlisted: countsRaw?.filter((r) => r.status === "shortlisted").length || 0,
    rejected: countsRaw?.filter((r) => r.status === "rejected").length || 0,
  };

  return (
    <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 px-4 lg:px-6 py-8">
      <AdminSidebar counts={counts} />

      <section className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-5">
          <h1 className="text-2xl font-semibold">Candidaturas</h1>
          <span className="text-sm text-white/50">
            {rows?.length || 0} {rows?.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            Error: {error.message}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-10 text-center text-white/60">
            Aún no hay candidaturas que cumplan los filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((r) => (
              <ApplicationCard key={r.id} row={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
