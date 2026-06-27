"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";

type App = {
  id: string;
  created_at: string;
  full_name: string;
  age: number;
  country: string;
  email: string;
  whatsapp: string | null;
  price_per_clip: number;
  currency: "EUR" | "USD";
  software: string[];
  experience_years: number;
  experience_text: string | null;
  work_links: { label: string; url: string }[];
  portfolio_url: string | null;
  test_video_path: string;
  test_video_size_mb: number | null;
  status: "pending" | "shortlisted" | "rejected";
  admin_notes: string | null;
};

export default function ApplicationDetail({ app }: { app: App }) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState(app.admin_notes || "");
  const [status, setStatus] = useState(app.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/applications/${app.id}/video`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setVideoUrl(d.url); });
    return () => { cancelled = true; };
  }, [app.id]);

  const save = async (newStatus: App["status"]) => {
    setSaving(true);
    const res = await fetch(`/api/admin/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, admin_notes: notes }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">{app.full_name}</h2>
        <dl className="grid grid-cols-3 gap-y-2 text-sm">
          <dt className="text-white/60">Email</dt><dd className="col-span-2">{app.email}</dd>
          {app.whatsapp && (<><dt className="text-white/60">WhatsApp</dt><dd className="col-span-2">{app.whatsapp}</dd></>)}
          <dt className="text-white/60">Edad</dt><dd className="col-span-2">{app.age}</dd>
          <dt className="text-white/60">País</dt><dd className="col-span-2">{app.country}</dd>
          <dt className="text-white/60">Precio</dt><dd className="col-span-2">{app.price_per_clip} {app.currency} / clip</dd>
          <dt className="text-white/60">Software</dt><dd className="col-span-2">{app.software.join(", ")}</dd>
          <dt className="text-white/60">Experiencia</dt><dd className="col-span-2">{app.experience_years} años</dd>
          {app.experience_text && (<><dt className="text-white/60">Sobre</dt><dd className="col-span-2 whitespace-pre-wrap">{app.experience_text}</dd></>)}
          {app.portfolio_url && (
            <><dt className="text-white/60">Portfolio</dt>
              <dd className="col-span-2"><a className="underline" href={app.portfolio_url} target="_blank" rel="noreferrer">{app.portfolio_url}</a></dd></>
          )}
          {app.work_links.length > 0 && (
            <><dt className="text-white/60">Trabajos</dt>
              <dd className="col-span-2 flex flex-col gap-1">
                {app.work_links.map((l, i) => (
                  <a key={i} className="underline" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                ))}
              </dd></>
          )}
        </dl>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Vídeo de prueba</h2>
        {videoUrl ? (
          <video src={videoUrl} controls className="w-full rounded-lg" />
        ) : (
          <div className="text-white/60">Cargando reproductor…</div>
        )}
        <div className="mt-4">
          <label className="block text-sm text-white/70 mb-1">Notas internas</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => save("shortlisted")}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${status === "shortlisted" ? "bg-green-500 text-black" : "bg-white/10 hover:bg-white/20"}`}
          >Preseleccionar</button>
          <button
            onClick={() => save("rejected")}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${status === "rejected" ? "bg-red-500 text-black" : "bg-white/10 hover:bg-white/20"}`}
          >Descartar</button>
          <button
            onClick={() => save("pending")}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${status === "pending" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}
          >Pendiente</button>
        </div>
      </GlassCard>
    </div>
  );
}
