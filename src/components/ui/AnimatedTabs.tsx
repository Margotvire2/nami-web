"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

interface AnimatedTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function AnimatedTabs({ tabs, activeTab, onTabChange, className }: AnimatedTabsProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current.get(activeTab)
    if (!el) return
    const parent = el.parentElement
    if (!parent) return
    const parentRect = parent.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setIndicator({ left: elRect.left - parentRect.left, width: elRect.width })
  }, [activeTab, tabs])

  return (
    <div className={cn("nami-tabs", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
          className={cn("nami-tab flex items-center gap-1.5", activeTab === tab.id && "active")}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className={cn(
              "min-w-[16px] h-[16px] px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center",
              activeTab === tab.id ? "bg-[#5B4EC4] text-white" : "bg-[#E8ECF4] text-[#94A3B8]"
            )}>
              {tab.badge > 99 ? "99+" : tab.badge}
            </span>
          )}
        </button>
      ))}
      <div
        className="nami-tab-indicator"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  )
}
