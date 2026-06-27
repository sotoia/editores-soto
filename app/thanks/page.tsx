import GlassCard from "@/components/GlassCard";
import Link from "next/link";

export default function Thanks() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full text-center">
        <h1 className="text-3xl font-semibold mb-2">¡Candidatura recibida!</h1>
        <p className="text-white/70 mb-6">
          La revisaré en los próximos días. Si me encajas, te escribo al email o WhatsApp que pusiste.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90"
        >
          Volver
        </Link>
      </GlassCard>
    </main>
  );
}
