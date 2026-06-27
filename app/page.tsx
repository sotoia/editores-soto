import ApplicationForm from "@/components/form/ApplicationForm";
import HeroVideo from "@/components/HeroVideo";
import ReferenceClip from "@/components/ReferenceClip";
import MustHaves from "@/components/MustHaves";
import CountdownTimer from "@/components/CountdownTimer";

const SOURCE_VIDEO_URL = process.env.NEXT_PUBLIC_SOURCE_VIDEO_URL || "";
const REFERENCE_CLIP_URL =
  process.env.NEXT_PUBLIC_REFERENCE_CLIP_URL ||
  "https://pub-4d3337c4cffa4a9f882ccbeb4302fb20.r2.dev/source/clip-referencia.mp4";

// Deadline ISO. If env var missing, defaults to 24h from build time.
const DEADLINE =
  process.env.NEXT_PUBLIC_CASTING_DEADLINE ||
  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 gap-10">
      <section className="max-w-3xl w-full text-center flex flex-col gap-6 items-center">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Busco editor de clips verticales para SOTO.IA
        </h1>
        <p className="text-white/70 text-lg">
          Vídeos de IA, programación con IA, vibe coding. Tono juvenil, semiviral, con
          zooms, subtítulos animados y motion graphics.
        </p>
        <p className="text-white/65 text-base">
          Este es un <strong className="text-white">proceso de selección con prueba real</strong>.
          Edita un clip vertical a partir del vídeo fuente y súbelo. La{" "}
          <strong className="text-white">prueba ganadora será remunerada</strong> y al ganador le
          ofreceré editar mis clips de forma continua. Anuncio el resultado en{" "}
          <strong className="text-white">24 horas</strong>.
        </p>

        <CountdownTimer deadline={DEADLINE} />

        <HeroVideo
          youtubeId="2pUKG8vIQLM"
          thumbnailSrc="/hero-elgato.png"
          downloadUrl={SOURCE_VIDEO_URL || undefined}
        />
      </section>

      <section className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 items-stretch">
        <ReferenceClip src={REFERENCE_CLIP_URL} />
        <MustHaves />
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
