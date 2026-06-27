import { notFound } from "next/navigation";
import Link from "next/link";
import ApplicationDetail from "@/components/admin/ApplicationDetail";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDetail({ params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !data) notFound();

  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-5 px-4 lg:px-6 py-8">
      <Link href="/admin" className="text-white/60 hover:text-white text-sm">← Volver al listado</Link>
      <ApplicationDetail app={data} />
    </main>
  );
}
