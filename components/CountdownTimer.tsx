"use client";
import { useEffect, useState } from "react";

type Props = {
  /** Deadline as ISO timestamp string. */
  deadline: string;
};

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const totalSec = Math.floor(ms / 1000);
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    done: ms === 0,
  };
}

export default function CountdownTimer({ deadline }: Props) {
  const target = new Date(deadline).getTime();
  const [now, setNow] = useState(() => diff(target));

  useEffect(() => {
    const t = setInterval(() => setNow(diff(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (now.done) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-200 border border-red-500/30 text-sm">
        ⏰ Plazo cerrado · ganador anunciado en breve
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl">
      <span className="text-xs uppercase tracking-wider text-white/55">Anuncio del ganador en</span>
      <div className="flex items-center gap-1.5 font-mono tabular-nums">
        <Cell n={now.h} label="h" />
        <span className="text-white/30">:</span>
        <Cell n={now.m} label="min" />
        <span className="text-white/30">:</span>
        <Cell n={now.s} label="seg" />
      </div>
    </div>
  );
}

function Cell({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span className="text-xl font-semibold">{String(n).padStart(2, "0")}</span>
      <span className="text-[9px] uppercase tracking-wider text-white/45 mt-0.5">{label}</span>
    </span>
  );
}
