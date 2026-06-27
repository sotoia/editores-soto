import GlassCard from "@/components/GlassCard";
import Link from "next/link";

export default function Thanks() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-lg w-full text-center">
        <div className="text-5xl mb-3">📨</div>
        <h1 className="text-3xl font-semibold mb-2">¡Candidatura recibida!</h1>
        <p className="text-white/70 mb-6">
          Te he mandado un email de confirmación a tu correo con el resumen de tu propuesta.
        </p>

        <div className="text-left bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4 mb-6">
          <div className="text-yellow-200 text-sm font-semibold mb-2">
            ⚠️ Importante · revisa tu carpeta de SPAM
          </div>
          <ol className="text-yellow-100/85 text-sm leading-relaxed space-y-1 list-decimal list-inside">
            <li>
              Si no ves el email en tu bandeja en 2 minutos, mira en{" "}
              <strong>Spam / Correo no deseado</strong>.
            </li>
            <li>
              Cuando lo encuentres, ábrelo y marca{" "}
              <strong>“No es spam” / “Marcar como no spam”</strong>.
            </li>
            <li>
              Añade <strong>pyneal.systems@gmail.com</strong> a tus contactos para que las
              próximas respuestas lleguen directas a la bandeja.
            </li>
          </ol>
          <div className="text-yellow-100/65 text-xs mt-3">
            Sin esto, mi respuesta final con la decisión podría no llegarte.
          </div>
        </div>

        <p className="text-white/65 text-sm mb-6">
          Revisaré tu prueba en las próximas 24 horas. Si te seleccionamos, te escribo al
          email o WhatsApp que pusiste.
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
