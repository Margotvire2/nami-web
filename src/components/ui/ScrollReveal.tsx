"use client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { CSSProperties, ReactNode } from "react";

type Variant = "fade-up" | "fade-left" | "fade-right" | "fade-scale" | "fade-blur";

const variants: Record<Variant, { hidden: CSSProperties; visible: CSSProperties }> = {
  "fade-up": {
    hidden: { opacity: 0, transform: "translateY(40px)" },
    visible: { opacity: 1, transform: "translateY(0)" },
  },
  "fade-left": {
    hidden: { opacity: 0, transform: "translateX(-50px)" },
    visible: { opacity: 1, transform: "translateX(0)" },
  },
  "fade-right": {
    hidden: { opacity: 0, transform: "translateX(50px)" },
    visible: { opacity: 1, transform: "translateX(0)" },
  },
  "fade-scale": {
    hidden: { opacity: 0, transform: "scale(0.92)" },
    visible: { opacity: 1, transform: "scale(1)" },
  },
  "fade-blur": {
    hidden: { opacity: 0, filter: "blur(8px)", transform: "translateY(20px)" },
    visible: { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
  },
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.8,
  className = "",
  style = {},
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { ref, isVisible } = useScrollReveal();
  const v = variants[variant];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(isVisible ? v.visible : v.hidden),
        transition: `opacity ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s, filter ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
