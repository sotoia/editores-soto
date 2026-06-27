import Link from "next/link";

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  country: string;
  email: string;
  price_per_clip: number;
  currency: "EUR" | "USD";
  software: string[];
  experience_years: number;
  status: "pending" | "shortlisted" | "rejected";
  brief: "elgato" | "autocont";
};

const STATUS_LABEL: Record<Row["status"], string> = {
  pending: "Pendiente",
  shortlisted: "Preseleccionado",
  rejected: "Descartado",
};

const STATUS_STYLE: Record<Row["status"], string> = {
  pending: "bg-white/10 text-white border-white/15",
  shortlisted: "bg-green-500/20 text-green-300 border-green-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
};

const BRIEF_LABEL: Record<Row["brief"], string> = {
  elgato: "Elgato Prompter",
  autocont: "AUTOCONT",
};

const SW_LABEL: Record<string, string> = {
  davinci: "DaVinci",
  aftereffects: "After Effects",
  premiere: "Premiere",
  capcut: "CapCut",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ApplicationCard({ row }: { row: Row }) {
  return (
    <Link
      href={`/admin/${row.id}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 hover:border-white/30 hover:bg-white/[0.06] transition"
    >
      <div className="flex items-start gap-4">
        <div className="grid place-items-center w-12 h-12 rounded-full bg-white/10 text-white font-semibold shrink-0">
          {initials(row.full_name) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold truncate">{row.full_name}</div>
              <div className="text-xs text-white/50 truncate">{row.country}</div>
            </div>
            <span
              className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${STATUS_STYLE[row.status]}`}
            >
              {STATUS_LABEL[row.status]}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/8 border border-white/10 text-white/70">
              Brief · {BRIEF_LABEL[row.brief]}
            </span>
            {row.software.map((s) => (
              <span
                key={s}
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
              >
                {SW_LABEL[s] || s}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="text-white/70">
              <span className="text-white font-medium">{row.price_per_clip} {row.currency}</span>
              <span className="text-white/40"> / clip</span>
            </div>
            <div className="text-xs text-white/40">
              {row.experience_years}a · {new Date(row.created_at).toLocaleDateString("es-ES")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
