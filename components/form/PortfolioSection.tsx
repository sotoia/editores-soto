"use client";

type WorkLink = { label: string; url: string };

type Props = {
  values: {
    portfolio_url: string;
    work_links: WorkLink[];
  };
  onChange: (patch: Partial<Props["values"]>) => void;
};

export default function PortfolioSection({ values, onChange }: Props) {
  const setLink = (i: number, patch: Partial<WorkLink>) => {
    const next = values.work_links.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange({ work_links: next });
  };
  const addLink = () => {
    if (values.work_links.length >= 5) return;
    onChange({ work_links: [...values.work_links, { label: "", url: "" }] });
  };
  const removeLink = (i: number) => {
    onChange({ work_links: values.work_links.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Enlace a portfolio (opcional)</span>
        <input
          type="url"
          placeholder="https://"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.portfolio_url}
          onChange={(e) => onChange({ portfolio_url: e.target.value })}
        />
      </label>

      <div>
        <span className="text-sm text-white/70">Ejemplos de trabajos (hasta 5 enlaces)</span>
        <div className="flex flex-col gap-2 mt-2">
          {values.work_links.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                placeholder="Título"
                className="col-span-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                value={l.label}
                onChange={(e) => setLink(i, { label: e.target.value })}
              />
              <input
                type="url"
                placeholder="https://"
                className="col-span-7 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                value={l.url}
                onChange={(e) => setLink(i, { url: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="col-span-1 bg-white/10 hover:bg-white/20 rounded-lg"
                aria-label="Eliminar enlace"
              >×</button>
            </div>
          ))}
          {values.work_links.length < 5 && (
            <button
              type="button"
              onClick={addLink}
              className="self-start px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
            >+ añadir enlace</button>
          )}
        </div>
      </div>
    </div>
  );
}
