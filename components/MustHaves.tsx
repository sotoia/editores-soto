const ITEMS = [
  { title: "Subtítulos animados", body: "Word-by-word o pop. Sin subtítulos de YouTube auto." },
  { title: "Zooms con criterio", body: "Para enfatizar, no de decoración. Suaves, no bruscos." },
  { title: "Encuadre cuidado", body: "Reframe a 9:16 con el sujeto centrado. Cabezas sin cortar." },
  { title: "Cortes adaptados a viral", body: "Hook en los primeros 3s. Sin tiempos muertos." },
  { title: "Motion graphics que aportan", body: "Datos, iconos, callouts. Nada de adornos sin info." },
  { title: "Audio limpio", body: "Voz comprimida, sin clipping, con música a bajo nivel." },
];

export default function MustHaves() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 h-full flex flex-col">
      <div className="text-xs uppercase tracking-wider text-white/50 mb-2">
        Obligatorio · qué necesita tener tu clip
      </div>
      <ul className="space-y-3 mt-2">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex gap-3">
            <span className="mt-1 shrink-0 grid place-items-center w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold">✓</span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-xs text-white/55 leading-relaxed">{it.body}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
