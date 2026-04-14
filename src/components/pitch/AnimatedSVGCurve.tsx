"use client"

import { useEffect, useRef } from "react"

interface Props {
  values: number[]
  color: string
  width?: number
  height?: number
  /** When this changes to true, the curve re-draws itself */
  isActive?: boolean
}

export function AnimatedSVGCurve({
  values,
  color,
  width = 280,
  height = 64,
  isActive = true,
}: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const lengthRef = useRef<number>(0)

  const PAD = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const pts = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (width - PAD * 2),
    y: height - PAD - ((v - min) / range) * (height - PAD * 2),
  }))

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")
  const fill = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`
  const last = pts[pts.length - 1]

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    lengthRef.current = length
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`
    path.style.transition = "none"
  }, [values])

  useEffect(() => {
    if (!isActive) return
    const path = pathRef.current
    if (!path) return
    const length = lengthRef.current || path.getTotalLength()

    // Reset first
    path.style.transition = "none"
    path.style.strokeDashoffset = `${length}`

    // Then animate — two rAF frames to ensure the reset is painted
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.3s cubic-bezier(0.16, 1, 0.3, 1) 0.1s"
        path.style.strokeDashoffset = "0"
      })
    })
    return () => cancelAnimationFrame(id)
  }, [isActive])

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <path d={fill} fill={color} fillOpacity={0.07} />
      <path
        ref={pathRef}
        d={line}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle cx={last.x} cy={last.y} r={7} fill={color} fillOpacity={0.12} />
      <circle cx={last.x} cy={last.y} r={4} fill={color} />
    </svg>
  )
}
