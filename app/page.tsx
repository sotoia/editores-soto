import Image from "next/image";
import ApplicationForm from "@/components/form/ApplicationForm";
import GlassCard from "@/components/GlassCard";

const SOURCE_VIDEO_URL = process.env.NEXT_PUBLIC_SOURCE_VIDEO_URL || "";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 gap-12">
      <section className="max-w-3xl w-full text-center flex flex-col gap-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Busco editor de clips verticales para SOTO.IA
        </h1>
        <p className="text-white/70 text-lg">
          Vídeos de IA, programación con IA, vibe coding. Tono juvenil, semiviral, con
          zooms, subtítulos animados y motion graphics. Edita un clip vertical de 40–60s a
          partir de este vídeo:
        </p>

        <GlassCard className="!p-3">
          <div className="aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src="/hero-elgato.png"
              alt="Vídeo de referencia SOTO.IA"
              width={1920}
              height={1080}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        </GlassCard>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://youtu.be/2pUKG8vIQLM"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition"
          >
            ▶ Ver en YouTube
          </a>
          {SOURCE_VIDEO_URL ? (
            <a
              href={SOURCE_VIDEO_URL}
              className="px-5 py-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              download
            >
              ⬇ Descargar vídeo fuente (.mp4)
            </a>
          ) : (
            <span
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
              title="Disponible en breve"
            >
              ⬇ Descargar vídeo fuente (próximamente)
            </span>
          )}
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 mt-4">
          <iframe
            src="https://www.youtube-nocookie.com/embed/2pUKG8vIQLM"
            title="Vídeo de referencia SOTO.IA"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p className="text-white/70 text-sm">
          Sube tu clip de prueba abajo (40–60s, máx 50 MB).
        </p>
      </section>
      <ApplicationForm />
    </main>
  );
}
