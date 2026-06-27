"use client";
import { SOFTWARE_OPTIONS, type Software } from "@/lib/schema";

const SW_LABELS: Record<Software, string> = {
  davinci: "DaVinci Resolve",
  aftereffects: "After Effects",
  premiere: "Premiere Pro",
  capcut: "CapCut",
};

type Props = {
  values: {
    price_per_clip: string;
    currency: "EUR" | "USD";
    software: Software[];
    experience_years: string;
    experience_text: string;
  };
  onChange: (patch: Partial<Props["values"]>) => void;
};

export default function WorkSection({ values, onChange }: Props) {
  const toggle = (s: Software) => {
    const set = new Set(values.software);
    if (set.has(s)) { set.delete(s); } else { set.add(s); }
    onChange({ software: Array.from(set) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-white/70">
            Coste por clip vertical (30–60s)
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
            value={values.price_per_clip}
            onChange={(e) => onChange({ price_per_clip: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/70">Divisa</span>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
            value={values.currency}
            onChange={(e) => onChange({ currency: e.target.value as "EUR" | "USD" })}
          >
            <option value="EUR" className="bg-black">EUR €</option>
            <option value="USD" className="bg-black">USD $</option>
          </select>
        </label>
      </div>

      <div>
        <span className="text-sm text-white/70">Programas que usas</span>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SOFTWARE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={`px-3 py-2 rounded-lg border text-left transition ${
                values.software.includes(s)
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/10 hover:border-white/30"
              }`}
            >
              {SW_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Años de experiencia</span>
        <input
          type="number"
          min={0}
          max={80}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.experience_years}
          onChange={(e) => onChange({ experience_years: e.target.value })}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Cuéntame brevemente tu experiencia (opcional)</span>
        <textarea
          rows={4}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.experience_text}
          onChange={(e) => onChange({ experience_text: e.target.value })}
        />
      </label>
    </div>
  );
}
