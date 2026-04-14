import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
}

/** Drop-in skeleton shimmer. Use like: <Shimmer className="h-4 w-32 rounded" /> */
export function Shimmer({ className }: ShimmerProps) {
  return <div className={cn("nami-shimmer rounded-md", className)} aria-hidden />
}

/** Shimmer text line preset */
export function ShimmerLine({ width = "100%" }: { width?: string }) {
  return <div className="nami-shimmer h-4 rounded-md" style={{ width }} aria-hidden />
}

/** Shimmer card preset */
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#E8ECF4] bg-white p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="nami-shimmer w-10 h-10 rounded-full shrink-0" aria-hidden />
        <div className="flex-1 space-y-2">
          <ShimmerLine width="60%" />
          <ShimmerLine width="40%" />
        </div>
      </div>
      <ShimmerLine width="100%" />
      <ShimmerLine width="80%" />
    </div>
  )
}
