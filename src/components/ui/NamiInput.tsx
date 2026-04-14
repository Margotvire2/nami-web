"use client"

import { forwardRef, useId, useState } from "react"
import { cn } from "@/lib/utils"

interface NamiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const NamiInput = forwardRef<HTMLInputElement, NamiInputProps>(
  function NamiInput({ label, error, hint, className, id, value, defaultValue, onChange, ...props }, ref) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const [internalValue, setInternalValue] = useState(defaultValue ?? "")

    const controlledValue = value !== undefined ? value : internalValue
    const hasValue = String(controlledValue ?? "").length > 0

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (value === undefined) setInternalValue(e.target.value)
      onChange?.(e)
    }

    return (
      <div className="flex flex-col gap-1">
        <div className={cn("nami-float-label", hasValue && "has-value")}>
          <input
            ref={ref}
            id={inputId}
            value={controlledValue}
            onChange={handleChange}
            placeholder=" "
            className={cn(
              "w-full rounded-xl border border-[#E8ECF4] bg-white px-3 py-2 text-sm text-[#0F172A]",
              "transition-colors placeholder-transparent",
              error && "border-red-400",
              className
            )}
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="text-sm font-normal"
          >
            {label}
          </label>
        </div>
        {error && <p className="text-[11px] text-red-500 px-1">{error}</p>}
        {hint && !error && <p className="text-[11px] text-[#94A3B8] px-1">{hint}</p>}
      </div>
    )
  }
)

NamiInput.displayName = "NamiInput"
