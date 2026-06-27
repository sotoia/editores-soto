import ApplicationForm from "@/components/form/ApplicationForm";
import HeroVideo from "@/components/HeroVideo";

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

        <HeroVideo
          youtubeId="2pUKG8vIQLM"
          thumbnailSrc="/hero-elgato.png"
          downloadUrl={SOURCE_VIDEO_URL || undefined}
        />

        <p className="text-white/70 text-sm mt-2">
          Sube tu clip de prueba abajo (40–60s, máx 50 MB).
        </p>
      </section>
      <ApplicationForm />
    </main>
  );
}
