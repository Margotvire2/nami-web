"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface NamiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "flat" = no hover, "lift" = standard lift, "depth" = premium depth effect */
  variant?: "flat" | "lift" | "depth"
  padding?: "none" | "sm" | "md" | "lg"
  as?: React.ElementType
}

const PADDING = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
}

export const NamiCard = forwardRef<HTMLDivElement, NamiCardProps>(
  function NamiCard({ variant = "lift", padding = "md", className, as: Tag = "div", ...props }, ref) {
    return (
      <Tag
        ref={ref}
        className={cn(
          "rounded-2xl bg-white",
          variant === "flat"  && "nami-card",
          variant === "lift"  && "nami-card-interactive",
          variant === "depth" && "nami-card-depth",
          PADDING[padding],
          className
        )}
        {...props}
      />
    )
  }
)

NamiCard.displayName = "NamiCard"
