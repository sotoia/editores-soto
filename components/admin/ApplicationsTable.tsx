"use client";
import Link from "next/link";

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  country: string;
  email: string;
  whatsapp: string | null;
  price_per_clip: number;
  currency: "EUR" | "USD";
  software: string[];
  experience_years: number;
  status: "pending" | "shortlisted" | "rejected";
};

const STATUS_LABEL: Record<Row["status"], string> = {
  pending: "Pendiente",
  shortlisted: "Preseleccionado",
  rejected: "Descartado",
};

const STATUS_COLOR: Record<Row["status"], string> = {
  pending: "bg-white/10 text-white",
  shortlisted: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
};

export default function ApplicationsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return <div className="text-white/60">Aún no hay candidaturas.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="text-left px-4 py-3">Fecha</th>
            <th className="text-left px-4 py-3">Nombre</th>
            <th className="text-left px-4 py-3">País</th>
            <th className="text-left px-4 py-3">Precio</th>
            <th className="text-left px-4 py-3">Software</th>
            <th className="text-left px-4 py-3">Exp.</th>
            <th className="text-left px-4 py-3">Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 text-white/70">
                {new Date(r.created_at).toLocaleDateString("es-ES")}
              </td>
              <td className="px-4 py-3">{r.full_name}</td>
              <td className="px-4 py-3">{r.country}</td>
              <td className="px-4 py-3">{r.price_per_clip} {r.currency}</td>
              <td className="px-4 py-3 text-white/70">{r.software.join(", ")}</td>
              <td className="px-4 py-3">{r.experience_years}a</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/${r.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
