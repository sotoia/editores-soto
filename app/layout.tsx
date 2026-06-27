import type { Metadata } from "next";
import LiquidGradient from "@/components/LiquidGradient";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casting de editores · SOTO.IA",
  description: "Únete al equipo de editores de clips verticales de SOTO.IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <div className="fixed inset-0 -z-10">
          <LiquidGradient
            colors={["#000000", "#2B2B2B", "#454545", "#212121"]}
            speed={0.24}
            scale={0.82}
            turbAmp={1.5}
            turbFreq={0.88}
            turbIter={5}
            waveFreq={1.73}
            jellify={1}
            distBias={0.21}
            dither={0.1}
            ditherMode={2}
            contrast={1.31}
            saturation={1.5}
            exposure={0.71}
            seed={50.55}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
