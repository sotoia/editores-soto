import GlassCard from "@/components/GlassCard";

type Props = { src: string };

export default function ReferenceClip({ src }: Props) {
  return (
    <GlassCard className="!p-5">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-white/50 mb-2">
            Referencia · encuadre y subtítulos
          </div>
          <h3 className="text-xl font-semibold mb-2">Así de bien debería quedar tu clip</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Vertical 9:16, ritmo rápido, subtítulos animados, zooms con criterio, motion graphics
            que añaden información (no de relleno). Sin transiciones de TikTok genéricas.
          </p>
        </div>
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="rounded-xl bg-black w-full max-w-[260px] aspect-[9/16] object-cover shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        />
      </div>
    </GlassCard>
  );
}
