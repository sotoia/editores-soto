"use client";
import type { Brief } from "@/lib/schema";

const BRIEFS: { id: Brief; tag: string; title: string; body: string }[] = [
  {
    id: "elgato",
    tag: "Brief 1 · Producto",
    title: "Elgato Prompter",
    body: "Enfoca el clip en presentar el Elgato Prompter como producto: planos del hardware, integración en el setup, el momento de leer un guion, ganchos de utilidad para creadores. Tono review/showcase.",
  },
  {
    id: "autocont",
    tag: "Brief 2 · Storytelling IA",
    title: "AUTOCONT — una IA que hace los vídeos por mí",
    body: "Enfoca el clip en la historia de AUTOCONT: el sistema que automatiza guion + producción. Tono más narrativo/viral, build-up del proceso, big reveal del resultado. Texto en pantalla protagonista.",
  },
];

type Props = {
  value: Brief | null;
  onChange: (b: Brief) => void;
};

export default function BriefPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {BRIEFS.map((b) => {
        const active = value === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            className={`text-left p-5 rounded-2xl border transition ${
              active
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/[0.04] hover:border-white/35"
            }`}
          >
            <div className={`text-xs uppercase tracking-wider mb-2 ${active ? "text-black/60" : "text-white/50"}`}>
              {b.tag}
            </div>
            <div className="text-lg font-semibold mb-2">{b.title}</div>
            <p className={`text-sm leading-relaxed ${active ? "text-black/75" : "text-white/65"}`}>
              {b.body}
            </p>
          </button>
        );
      })}
    </div>
  );
}
