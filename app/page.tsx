import ApplicationForm from "@/components/form/ApplicationForm";
import HeroVideo from "@/components/HeroVideo";
import ReferenceClip from "@/components/ReferenceClip";

const SOURCE_VIDEO_URL = process.env.NEXT_PUBLIC_SOURCE_VIDEO_URL || "";
const REFERENCE_CLIP_URL =
  process.env.NEXT_PUBLIC_REFERENCE_CLIP_URL ||
  "https://pub-4d3337c4cffa4a9f882ccbeb4302fb20.r2.dev/source/clip-referencia.mp4";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 gap-10">
      <section className="max-w-3xl w-full text-center flex flex-col gap-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Busco editor de clips verticales para SOTO.IA
        </h1>
        <p className="text-white/70 text-lg">
          Vídeos de IA, programación con IA, vibe coding. Tono juvenil, semiviral, con
          zooms, subtítulos animados y motion graphics. Este es el vídeo fuente:
        </p>

        <HeroVideo
          youtubeId="2pUKG8vIQLM"
          thumbnailSrc="/hero-elgato.png"
          downloadUrl={SOURCE_VIDEO_URL || undefined}
        />
      </section>

      <section className="max-w-3xl w-full">
        <ReferenceClip src={REFERENCE_CLIP_URL} />
      </section>

      <section className="max-w-3xl w-full text-center">
        <p className="text-white/70 text-sm">
          Sube tu clip de prueba abajo (40–60s, máx 120 MB). Elige primero qué brief editas.
        </p>
      </section>

      <ApplicationForm />
    </main>
  );
}
