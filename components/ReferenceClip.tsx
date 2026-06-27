type Props = { src: string };

export default function ReferenceClip({ src }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 h-full flex flex-col">
      <div className="text-xs uppercase tracking-wider text-white/50 mb-2">
        Referencia · encuadre y subtítulos
      </div>
      <h3 className="text-lg font-semibold mb-2">Así de bien debería quedar tu clip</h3>
      <p className="text-white/65 text-sm leading-relaxed mb-4">
        Vertical 9:16, ritmo rápido, subtítulos animados, zooms con criterio, motion graphics
        que añaden información (no de relleno). Sin transiciones de TikTok genéricas.
      </p>
      <div className="flex-1 grid place-items-center">
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="rounded-2xl bg-black w-auto max-h-[420px] aspect-[9/16] object-contain shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}
