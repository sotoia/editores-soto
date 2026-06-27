"use client";
import { useRef, useState } from "react";

type Props = {
  onUploaded: (path: string, sizeMb: number) => void;
};

export default function VideoUploadSection({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<"idle" | "checking" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const onFile = async (file: File) => {
    if (progress === "checking" || progress === "uploading") return;
    setError(null);
    setFilename(file.name);
    setProgress("checking");

    if (file.size > 50 * 1024 * 1024) {
      setError("El vídeo supera los 50 MB. Comprímelo (1080×1920 a 8–10 Mbps cabe sobrado) y vuelve a intentarlo.");
      setProgress("error");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("El archivo debe ser un vídeo.");
      setProgress("error");
      return;
    }

    const duration = await readDuration(file).catch(() => null);
    if (duration === null) {
      setError("No pude leer la duración del vídeo. Prueba con MP4 / MOV.");
      setProgress("error");
      return;
    }
    if (duration < 40 || duration > 60) {
      setError(`El vídeo debe durar entre 40 y 60 segundos (el tuyo dura ${Math.round(duration)}s).`);
      setProgress("error");
      return;
    }

    setProgress("uploading");
    const intent = await fetch("/api/test-videos/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        size_bytes: file.size,
        content_type: file.type,
      }),
    });
    if (!intent.ok) {
      setError("No pude preparar la subida.");
      setProgress("error");
      return;
    }
    const { path, signed_url } = await intent.json();

    const put = await fetch(signed_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) {
      setError("La subida falló. Reintenta.");
      setProgress("error");
      return;
    }

    setProgress("done");
    onUploaded(path, +(file.size / (1024 * 1024)).toFixed(2));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-white/70">
        Sube un clip vertical de 40–60 segundos hecho a partir del vídeo de referencia (máx 50 MB).
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50"
        disabled={progress === "checking" || progress === "uploading"}
      >
        {progress === "idle" && "Seleccionar vídeo"}
        {progress === "checking" && "Comprobando…"}
        {progress === "uploading" && "Subiendo…"}
        {progress === "done" && `Subido ✓ (${filename})`}
        {progress === "error" && "Reintentar"}
      </button>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => reject(new Error("metadata error"));
    v.src = url;
  });
}
