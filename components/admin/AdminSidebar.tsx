"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Counts = {
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
};

const STATUSES = [
  { id: "", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "shortlisted", label: "Preseleccionadas" },
  { id: "rejected", label: "Descartadas" },
] as const;

const BRIEFS = [
  { id: "", label: "Todos" },
  { id: "elgato", label: "Elgato Prompter" },
  { id: "autocont", label: "AUTOCONT" },
] as const;

export default function AdminSidebar({ counts }: { counts: Counts }) {
  const params = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const status = params.get("status") || "";
  const brief = params.get("brief") || "";

  const setParam = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    startTransition(() => router.push(`/admin?${sp.toString()}`));
  };

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 self-start">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 flex flex-col gap-5">
        <Link href="/admin" className="block">
          <div className="text-xs uppercase tracking-wider text-white/50">SOTO.IA · admin</div>
          <div className="text-lg font-semibold mt-1">Casting de editores</div>
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Total" value={counts.total} tone="neutral" />
          <Stat label="Pending" value={counts.pending} tone="neutral" />
          <Stat label="Short." value={counts.shortlisted} tone="good" />
          <Stat label="Reject." value={counts.rejected} tone="bad" />
        </div>

        <FilterGroup title="Estado">
          {STATUSES.map((s) => (
            <Chip
              key={s.id}
              active={status === s.id}
              onClick={() => setParam("status", s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Brief">
          {BRIEFS.map((b) => (
            <Chip
              key={b.id}
              active={brief === b.id}
              onClick={() => setParam("brief", b.id)}
            >
              {b.label}
            </Chip>
          ))}
        </FilterGroup>

        <button
          onClick={logout}
          className="mt-2 text-sm text-white/50 hover:text-white text-left"
        >
          ← Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "neutral" | "good" | "bad" }) {
  const color =
    tone === "good" ? "text-green-300" : tone === "bad" ? "text-red-300" : "text-white";
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs transition ${
        active
          ? "bg-white text-black"
          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
