"use client";
import { COUNTRIES } from "@/lib/countries";

type Props = {
  values: {
    full_name: string;
    age: string;
    country: string;
    email: string;
    whatsapp: string;
  };
  onChange: (patch: Partial<Props["values"]>) => void;
};

export default function PersonalSection({ values, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Nombre completo</span>
        <input
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.full_name}
          onChange={(e) => onChange({ full_name: e.target.value })}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Edad</span>
        <input
          type="number"
          min={16}
          max={80}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.age}
          onChange={(e) => onChange({ age: e.target.value })}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">País de residencia</span>
        <select
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.country}
          onChange={(e) => onChange({ country: e.target.value })}
          required
        >
          <option value="">Selecciona…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c} className="bg-black">{c}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Email</span>
        <input
          type="email"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
          required
        />
      </label>
      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm text-white/70">WhatsApp (opcional, con prefijo)</span>
        <input
          type="tel"
          placeholder="+34600123123"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.whatsapp}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
        />
      </label>
    </div>
  );
}
