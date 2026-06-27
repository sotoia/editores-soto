"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import PersonalSection from "./PersonalSection";
import WorkSection from "./WorkSection";
import PortfolioSection from "./PortfolioSection";
import VideoUploadSection from "./VideoUploadSection";
import BriefPicker from "./BriefPicker";
import type { Software, Brief } from "@/lib/schema";

type FormState = {
  brief: Brief | null;
  full_name: string;
  age: string;
  country: string;
  email: string;
  whatsapp: string;
  price_per_clip: string;
  currency: "EUR" | "USD";
  software: Software[];
  experience_years: string;
  experience_text: string;
  portfolio_url: string;
  work_links: { label: string; url: string }[];
  test_video_path: string | null;
  test_video_size_mb: number | null;
};

const INITIAL: FormState = {
  brief: null,
  full_name: "",
  age: "",
  country: "",
  email: "",
  whatsapp: "",
  price_per_clip: "",
  currency: "EUR",
  software: [],
  experience_years: "",
  experience_text: "",
  portfolio_url: "",
  work_links: [],
  test_video_path: null,
  test_video_size_mb: null,
};

export default function ApplicationForm() {
  const router = useRouter();
  const [s, setS] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));

  const canSubmit =
    s.brief && s.full_name && s.age && s.country && s.email &&
    s.price_per_clip && s.software.length > 0 && s.experience_years &&
    s.test_video_path;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      brief: s.brief,
      full_name: s.full_name.trim(),
      age: Number(s.age),
      country: s.country,
      email: s.email.trim().toLowerCase(),
      whatsapp: s.whatsapp.trim() || null,
      price_per_clip: Number(s.price_per_clip),
      currency: s.currency,
      software: s.software,
      experience_years: Number(s.experience_years),
      experience_text: s.experience_text.trim() || null,
      work_links: s.work_links.filter((l) => l.label && l.url),
      portfolio_url: s.portfolio_url.trim() || null,
      test_video_path: s.test_video_path,
      test_video_size_mb: s.test_video_size_mb,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/thanks");
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error || "Algo falló. Reintenta.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-2xl">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Elige tu brief</h2>
        <p className="text-sm text-white/60 mb-4">
          Mismo vídeo fuente, dos enfoques distintos. Elige el que quieras editar.
        </p>
        <BriefPicker value={s.brief} onChange={(b) => patch({ brief: b })} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Sobre ti</h2>
        <PersonalSection values={s} onChange={patch} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Trabajo</h2>
        <WorkSection values={s} onChange={patch} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
        <PortfolioSection values={s} onChange={patch} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Vídeo de prueba</h2>
        <VideoUploadSection
          onUploaded={(path, sizeMb) =>
            patch({ test_video_path: path, test_video_size_mb: sizeMb })
          }
        />
      </GlassCard>

      {error && (
        <div className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Enviando…" : "Enviar candidatura"}
      </button>
    </form>
  );
}
