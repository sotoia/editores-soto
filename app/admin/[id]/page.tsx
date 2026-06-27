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
    <main className="max-w-6xl mx-auto flex flex-col gap-6">
      <Link href="/admin" className="text-white/60 hover:text-white text-sm">← Volver</Link>
      <ApplicationDetail app={data} />
    </main>
  );
}
