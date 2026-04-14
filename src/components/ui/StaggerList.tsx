"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface StaggerListProps {
  children: React.ReactNode
  className?: string
  /** Delay between each child (ms, default 60) */
  stepMs?: number
  /** Initial delay before first child (ms, default 0) */
  initialDelayMs?: number
  /** Trigger animation when element enters viewport (default true) */
  onView?: boolean
}

/**
 * Wraps children in a stagger reveal container.
 * Each direct child gets `nami-stagger-item` with increasing animation-delay.
 * Uses IntersectionObserver when onView=true (default).
 */
export function StaggerList({
  children,
  className,
  stepMs = 60,
  initialDelayMs = 0,
  onView = true,
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!onView)

  useEffect(() => {
    if (!onView) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [onView])

  return (
    <div ref={ref} className={cn("contents", className)}>
      {visible
        ? (() => {
            let idx = 0
            return Array.isArray(children)
              ? children.map((child) => (
                  <div
                    key={idx}
                    className="nami-stagger-item"
                    style={{ animationDelay: `${initialDelayMs + idx++ * stepMs}ms` }}
                  >
                    {child}
                  </div>
                ))
              : (
                <div className="nami-stagger-item" style={{ animationDelay: `${initialDelayMs}ms` }}>
                  {children}
                </div>
              )
          })()
        : children}
    </div>
  )
}
