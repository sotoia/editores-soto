"use client";
import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4">Admin · login</h1>
        {sent ? (
          <p className="text-white/80">Te he enviado un enlace mágico a {email}. Ábrelo desde este navegador.</p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 disabled:opacity-50"
            >
              {sending ? "Enviando…" : "Enviarme magic link"}
            </button>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </form>
        )}
      </GlassCard>
    </main>
  );
}
