"use client";
import { useState } from "react";
import Image from "next/image";

type Props = {
  youtubeId: string;
  thumbnailSrc: string;
  downloadUrl?: string;
};

export default function HeroVideo({ youtubeId, thumbnailSrc, downloadUrl }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title="Vídeo de referencia SOTO.IA"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label="Reproducir vídeo"
          >
            <Image
              src={thumbnailSrc}
              alt="Vídeo de referencia SOTO.IA"
              fill
              priority
              className="object-cover transition group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="grid place-items-center w-24 h-24 rounded-full bg-white/95 text-black shadow-[0_8px_30px_rgba(0,0,0,0.45)] group-hover:scale-105 transition">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" className="ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      {downloadUrl ? (
        <a
          href={downloadUrl}
          className="self-center inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition"
          download
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M5 20h14v-2H5v2zM12 4v9.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V4h1z" />
          </svg>
          Descargar vídeo fuente (.mp4)
        </a>
      ) : (
        <span
          className="self-center inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
          title="Disponible en breve"
        >
          ⬇ Descargar vídeo fuente (próximamente)
        </span>
      )}
    </div>
  );
}
