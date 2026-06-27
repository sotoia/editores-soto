"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  brief: "elgato" | "autocont";
  admin_notes: string | null;
};

const CONTAINER_TINT: Record<App["status"], string> = {
  pending: "border-white/10 bg-white/[0.04]",
  shortlisted: "border-green-500/40 bg-green-500/[0.08] shadow-[0_0_40px_-12px_rgba(34,197,94,0.45)]",
  rejected: "border-red-500/40 bg-red-500/[0.06] shadow-[0_0_36px_-14px_rgba(239,68,68,0.4)]",
};

const BRIEF_LABEL: Record<App["brief"], string> = {
  elgato: "Elgato Prompter",
  autocont: "AUTOCONT",
};

const SW_LABEL: Record<string, string> = {
  davinci: "DaVinci Resolve",
  aftereffects: "After Effects",
  premiere: "Premiere Pro",
  capcut: "CapCut",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ApplicationDetail({ app }: { app: App }) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState(app.admin_notes || "");
  const [status, setStatus] = useState(app.status);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

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
      setSavedAt(new Date());
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
      {/* Vertical video player */}
      <div className={`rounded-3xl border backdrop-blur-2xl p-5 flex flex-col items-center transition-colors ${CONTAINER_TINT[status]}`}>
        <div className="w-full flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-wider text-white/50">Vídeo de prueba</div>
          {videoUrl && (
            <a
              href={videoUrl}
              download
              className="text-xs text-white/60 hover:text-white"
            >
              ⬇ Descargar
            </a>
          )}
        </div>

        <div className="w-full grid place-items-center">
          {videoUrl ? (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              className="rounded-2xl bg-black w-auto max-w-full max-h-[70vh] aspect-[9/16] object-contain shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <div className="aspect-[9/16] w-full max-w-[260px] rounded-2xl border border-white/10 bg-black/40 grid place-items-center text-white/40 text-sm">
              Cargando reproductor…
            </div>
          )}
        </div>

        <div className="w-full mt-5 flex flex-wrap gap-2 justify-center">
          <StatusButton
            tone="good"
            active={status === "shortlisted"}
            disabled={saving}
            onClick={() => save("shortlisted")}
          >
            ✓ Preseleccionar
          </StatusButton>
          <StatusButton
            tone="bad"
            active={status === "rejected"}
            disabled={saving}
            onClick={() => save("rejected")}
          >
            ✕ Descartar
          </StatusButton>
          <StatusButton
            tone="neutral"
            active={status === "pending"}
            disabled={saving}
            onClick={() => save("pending")}
          >
            ↺ Pendiente
          </StatusButton>
        </div>
        {savedAt && (
          <div className="mt-2 text-xs text-white/40">
            Guardado a las {savedAt.toLocaleTimeString("es-ES")}
          </div>
        )}
      </div>

      {/* Right sidebar with info + notes */}
      <aside className="flex flex-col gap-5">
        <div className={`rounded-3xl border backdrop-blur-2xl p-5 transition-colors ${CONTAINER_TINT[status]}`}>
          <div className="flex items-start gap-4">
            <div className="grid place-items-center w-14 h-14 rounded-full bg-white/10 text-lg font-semibold shrink-0">
              {initials(app.full_name) || "?"}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-tight">{app.full_name}</div>
              <div className="text-sm text-white/55 mt-0.5">
                {app.country} · {app.age} años
              </div>
              <div className="mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/8 border border-white/10 text-white/70">
                Brief · {BRIEF_LABEL[app.brief]}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <Row label="Email"><a className="underline" href={`mailto:${app.email}`}>{app.email}</a></Row>
            {app.whatsapp && (
              <Row label="WhatsApp">
                <a className="underline" href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                  {app.whatsapp}
                </a>
              </Row>
            )}
            <Row label="Precio">{app.price_per_clip} {app.currency} / clip</Row>
            <Row label="Experiencia">{app.experience_years} años</Row>
            <Row label="Software">
              <div className="flex flex-wrap gap-1.5">
                {app.software.map((s) => (
                  <span key={s} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                    {SW_LABEL[s] || s}
                  </span>
                ))}
              </div>
            </Row>
            {app.experience_text && (
              <Row label="Sobre"><span className="whitespace-pre-wrap text-white/80">{app.experience_text}</span></Row>
            )}
            {app.portfolio_url && (
              <Row label="Portfolio">
                <a className="underline" href={app.portfolio_url} target="_blank" rel="noreferrer">{shorten(app.portfolio_url)}</a>
              </Row>
            )}
            {app.work_links.length > 0 && (
              <Row label="Trabajos">
                <div className="flex flex-col gap-1">
                  {app.work_links.map((l, i) => (
                    <a key={i} className="underline truncate" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                  ))}
                </div>
              </Row>
            )}
            <Row label="Recibida">{new Date(app.created_at).toLocaleString("es-ES")}</Row>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5">
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
            Notas internas
          </label>
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Lo que se te ocurra para acordarte después…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-white/40 text-sm"
          />
          <button
            type="button"
            onClick={() => save(status)}
            disabled={saving}
            className="mt-3 w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar notas"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <div className="text-white/50 text-xs uppercase tracking-wider pt-0.5">{label}</div>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

function StatusButton({
  tone,
  active,
  disabled,
  onClick,
  children,
}: {
  tone: "good" | "bad" | "neutral";
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeColor =
    tone === "good"
      ? "bg-green-500 text-black"
      : tone === "bad"
      ? "bg-red-500 text-black"
      : "bg-white text-black";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl text-sm transition ${
        active ? activeColor : "bg-white/8 border border-white/10 hover:bg-white/15"
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function shorten(url: string, max = 38) {
  return url.length > max ? url.slice(0, max - 1) + "…" : url;
}
