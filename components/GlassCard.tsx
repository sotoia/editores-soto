"use client";
import LiquidGlass from "liquid-glass-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: Props) {
  return (
    <LiquidGlass
      displacementScale={64}
      blurAmount={0.1}
      saturation={130}
      aberrationIntensity={2}
      elasticity={0.35}
      cornerRadius={24}
      padding="32px"
      mode="standard"
      className={`text-white ${className}`}
    >
      {children}
    </LiquidGlass>
  );
}
