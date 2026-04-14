"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface HeaderAction {
  label: string
  onClick: () => void
  variant?: "primary" | "danger" | "ghost"
  icon?: ReactNode
}

interface HeaderState {
  title?: string
  action?: HeaderAction
}

interface CockpitHeaderContextValue extends HeaderState {
  setHeader: (state: HeaderState) => void
  clearHeader: () => void
}

const CockpitHeaderContext = createContext<CockpitHeaderContextValue | null>(null)

export function CockpitHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeaderState>({})

  const setHeader = useCallback((s: HeaderState) => setState(s), [])
  const clearHeader = useCallback(() => setState({}), [])

  return (
    <CockpitHeaderContext.Provider value={{ ...state, setHeader, clearHeader }}>
      {children}
    </CockpitHeaderContext.Provider>
  )
}

export function useCockpitHeader() {
  const ctx = useContext(CockpitHeaderContext)
  if (!ctx) throw new Error("useCockpitHeader must be used within CockpitHeaderProvider")
  return ctx
}
