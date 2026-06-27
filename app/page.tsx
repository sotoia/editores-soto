import ApplicationForm from "@/components/form/ApplicationForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 gap-12">
      <section className="max-w-2xl text-center flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Busco editor de clips verticales para SOTO.IA
        </h1>
        <p className="text-white/70 text-lg">
          Vídeos de IA, programación con IA, vibe coding. Tono juvenil, semiviral,
          con zooms, subtítulos animados y motion graphics. Mira el reto:
        </p>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src="https://www.youtube-nocookie.com/embed/2pUKG8vIQLM"
            title="Vídeo de referencia SOTO.IA"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-white/70 text-sm">
          Edita un clip vertical de <strong>40–60 segundos</strong> desde ese vídeo y súbelo abajo.
        </p>
      </section>
      <ApplicationForm />
    </main>
  );
}
