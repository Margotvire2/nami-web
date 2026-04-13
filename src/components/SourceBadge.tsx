export function SourceBadge({ source, reference }: { source: string; reference?: string }) {
  const colors: Record<string, string> = {
    HAS: "bg-blue-50 text-blue-600 border-blue-100",
    FFAB: "bg-purple-50 text-purple-600 border-purple-100",
    ANSM: "bg-orange-50 text-orange-600 border-orange-100",
    "DSM-5": "bg-pink-50 text-pink-600 border-pink-100",
    ESPGHAN: "bg-green-50 text-green-600 border-green-100",
    FICHE: "bg-teal-50 text-teal-600 border-teal-100",
  }
  const c = colors[source] ?? "bg-neutral-50 text-neutral-500 border-neutral-100"
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${c}`}>
      {source}{reference ? ` · ${reference}` : ""}
    </span>
  )
}
