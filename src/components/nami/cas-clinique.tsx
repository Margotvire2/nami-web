"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, ChevronRight, ArrowLeft, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CasQuestion {
  question: string
  options: { label: string; correct: boolean }[]
  explanation: string
}

interface CasClinique {
  id: string
  title: string
  source: string
  difficulty: string
  tags: string[]
  presentation: string
  questions: CasQuestion[]
}

export function CasCliniquePlayer({ cas }: { cas: CasClinique }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = cas.questions[currentQ]

  function handleSelect(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)
    if (question.options[idx].correct) setScore((s) => s + 1)
  }

  function handleNext() {
    if (currentQ < cas.questions.length - 1) {
      setCurrentQ((q) => q + 1)
      setSelected(null)
      setShowExplanation(false)
    } else {
      setFinished(true)
    }
  }

  function handleReset() {
    setCurrentQ(0)
    setSelected(null)
    setShowExplanation(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Résultat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-primary">
              {score}/{cas.questions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {score === cas.questions.length
                ? "Parfait !"
                : score >= cas.questions.length / 2
                ? "Bien, quelques points à revoir."
                : "Revoir les protocoles associés."}
            </p>
            <Button onClick={handleReset} variant="outline" className="w-full">
              <RotateCcw className="size-4" />
              Recommencer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Presentation */}
      {currentQ === 0 && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>{cas.title}</CardTitle>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {cas.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
              <Badge variant="outline">{cas.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {cas.presentation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Question {currentQ + 1}/{cas.questions.length}</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((currentQ + 1) / cas.questions.length) * 100}%` }}
          />
        </div>
        <span>{score} correct{score > 1 ? "s" : ""}</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <h3 className="font-heading text-base font-semibold mb-3">
            {question.question}
          </h3>

          <div className="space-y-2">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-all",
                  selected === null && "hover:border-primary/30 hover:bg-primary/5",
                  selected !== null && opt.correct && "border-green-300 bg-green-50 dark:bg-green-950/30",
                  selected === idx && !opt.correct && "border-red-300 bg-red-50 dark:bg-red-950/30",
                  selected !== null && selected !== idx && !opt.correct && "opacity-50"
                )}
              >
                {selected !== null && opt.correct && (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                )}
                {selected === idx && !opt.correct && (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                )}
                {selected === null && (
                  <span className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <Card size="sm">
                <CardContent className="pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Explication
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {question.explanation}
                  </p>
                </CardContent>
              </Card>
              <Button onClick={handleNext} className="w-full mt-3">
                {currentQ < cas.questions.length - 1 ? (
                  <>Suivant <ChevronRight className="size-4" /></>
                ) : (
                  "Voir le résultat"
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
