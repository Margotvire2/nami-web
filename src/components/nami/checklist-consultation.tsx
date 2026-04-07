"use client"

import { useState } from "react"
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ChecklistItem {
  label: string
  critical: boolean
}

interface ChecklistSection {
  title: string
  items: ChecklistItem[]
}

interface Checklist {
  id: string
  title: string
  source: string
  sections: ChecklistSection[]
}

export function ChecklistConsultation({ checklist }: { checklist: Checklist }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const totalItems = checklist.sections.reduce((acc, s) => acc + s.items.length, 0)
  const checkedCount = checked.size
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-heading text-base font-semibold">{checklist.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{checklist.source}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{checkedCount}/{totalItems}</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress === 100 ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span>{Math.round(progress)}%</span>
      </div>

      {/* Sections */}
      {checklist.sections.map((section) => (
        <Card key={section.title} size="sm">
          <CardHeader className="border-b">
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-2">
            {section.items.map((item) => {
              const key = `${section.title}-${item.label}`
              const isChecked = checked.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-sm transition-all hover:bg-muted/50",
                    isChecked && "opacity-60"
                  )}
                >
                  {isChecked ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={cn(isChecked && "line-through")}>
                    {item.label}
                  </span>
                  {item.critical && !isChecked && (
                    <Badge variant="destructive" className="ml-auto shrink-0">
                      <AlertTriangle className="size-3" />
                    </Badge>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
