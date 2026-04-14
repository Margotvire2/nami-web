"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  /** Each string = one line. Words are split by spaces. */
  lines: string[]
  gradientWords?: string[]
  className?: string
  style?: React.CSSProperties
  /** Delay in ms before the first word appears (default 100) */
  initialDelay?: number
  /** Delay between words in ms (default 80) */
  wordDelay?: number
}

export function WordByWordTitle({
  lines,
  gradientWords = [],
  className = "",
  style = {},
  initialDelay = 100,
  wordDelay = 80,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const allWords = lines.flatMap((line, li) =>
    line.split(" ").map((word, wi) => ({ word, line: li, idx: wi, isLast: wi === line.split(" ").length - 1 }))
  )

  let wordCounter = 0

  return (
    <div ref={ref} className={className} style={style}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "block" }}>
          {line.split(" ").map((word, wi) => {
            const delay = initialDelay + wordCounter++ * wordDelay
            const isGradient = gradientWords.some(gw => word.toLowerCase().includes(gw.toLowerCase()))
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: wi < line.split(" ").length - 1 ? "0.28em" : 0,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
                  transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                  ...(isGradient ? {
                    background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } : {}),
                }}
              >
                {word}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
