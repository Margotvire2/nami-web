"use client";

import { useEffect, useRef, useState } from "react";

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

export function Reveal({
  children, delay = 0, from = "bottom", className = "", style = {}
}: {
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right" | "scale";
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ref, visible] = useReveal();
  const transforms: Record<string, string> = {
    bottom: "translateY(40px)", left: "translateX(-40px)",
    right: "translateX(40px)", scale: "scale(0.94) translateY(20px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[from],
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
