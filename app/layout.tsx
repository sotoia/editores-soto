import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casting de editores · SOTO.IA",
  description: "Únete al equipo de editores de clips verticales de SOTO.IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
