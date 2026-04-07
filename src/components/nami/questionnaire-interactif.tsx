"use client"

import { useState } from "react"
import { CheckCircle2, Circle, AlertTriangle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface QuestionnaireItem {
  lettre?: string
  num?: number
  question: string
  mot_cle?: string
}

interface Questionnaire {
  id: string
  nom: string
  nom_complet: string
  source: string
  type: string
  description: string
  seuil: number
  seuil_label: string
  items: QuestionnaireItem[]
}

export function QuestionnaireInteractif({ questionnaire }: { questionnaire: Questionnaire }) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const score = Object.values(answers).filter(Boolean).length
  const allAnswered = Object.keys(answers).length === questionnaire.items.length
  const isPositive = score >= questionnaire.seuil

  function toggle(idx: number) {
    setAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  function reset() {
    setAnswers({})
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-base font-semibold">{questionnaire.nom_complet}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{questionnaire.source}</p>
        <p className="text-sm text-muted-foreground mt-2">{questionnaire.description}</p>
      </div>

      <Card size="sm">
        <CardContent className="space-y-1 pt-3">
          {questionnaire.items.map((item, idx) => {
            const isChecked = answers[idx] === true
            return (
              <button
                key={idx}
                onClick={() => toggle(idx)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg p-2.5 text-left text-sm transition-all hover:bg-muted/50",
                )}
              >
                {isChecked ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                )}
                <div className="flex-1">
                  <span className={cn(isChecked && "text-primary font-medium")}>
                    {item.lettre && <span className="font-bold mr-1">{item.lettre} —</span>}
                    {item.question}
                  </span>
                  {item.mot_cle && (
                    <span className="ml-2 text-xs text-muted-foreground">({item.mot_cle})</span>
                  )}
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Score */}
      <Card size="sm" className={cn(
        allAnswered && isPositive && "border-red-200 bg-red-50 dark:bg-red-950/20",
        allAnswered && !isPositive && "border-green-200 bg-green-50 dark:bg-green-950/20"
      )}>
        <CardContent className="pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Score : {score} / {questionnaire.items.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {questionnaire.seuil_label}
              </p>
            </div>
            {allAnswered && (
              <Badge variant={isPositive ? "destructive" : "outline"}>
                {isPositive ? (
                  <><AlertTriangle className="size-3" /> Positif</>
                ) : (
                  <><CheckCircle2 className="size-3" /> Négatif</>
                )}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" size="sm" onClick={reset} className="w-full">
        <RotateCcw className="size-4" />
        Réinitialiser
      </Button>
    </div>
  )
}
