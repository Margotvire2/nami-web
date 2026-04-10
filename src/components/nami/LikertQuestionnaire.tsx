"use client";

/**
 * LikertQuestionnaire — formulaire générique pour questionnaires validés
 * (PHQ-9, GAD-7, EAT-26, SCOFF)
 *
 * [LEGAL] Présenté comme "outil de complétude du dossier" — jamais comme
 * outil diagnostique. L'interprétation clinique reste du ressort du soignant.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ChevronLeft, Info } from "lucide-react";
import {
  QuestionnaireDefinition,
  computeScore,
  getBand,
  isComplete,
  BAND_COLORS,
} from "@/lib/scoring/questionnaire-scoring";

interface Props {
  def: QuestionnaireDefinition;
  onSave: (score: number, answers: Record<number, number>) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function LikertQuestionnaire({ def, onSave, onCancel, isSaving }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answered = Object.keys(answers).length;
  const complete = isComplete(def, answers);
  const score = computeScore(def, answers);
  const band = complete ? getBand(def, score) : null;

  const scaleLabels = def.scaleLabels ?? ["Jamais", "Parfois", "Souvent", "Toujours"];
  const isBinary = def.scale === "binary";

  function setAnswer(idx: number, value: number) {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  }

  // Alerte item 9 du PHQ-9 (suicidalité)
  const showSuicidalityAlert =
    def.key === "phq9" && answers[8] !== undefined && answers[8] > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header questionnaire */}
      <div>
        <p className="text-xs text-muted-foreground">{def.source}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span>{def.itemCount} items</span>
          <span>·</span>
          <span>Score max : {def.maxScore}</span>
          <span>·</span>
          <span>{answered}/{def.itemCount} réponses</span>
        </div>
      </div>

      {/* En-tête scale */}
      {!isBinary && (
        <div className="grid text-[10px] font-medium text-muted-foreground text-center"
          style={{ gridTemplateColumns: `1fr repeat(${scaleLabels.length}, minmax(60px, 80px))` }}
        >
          <span className="text-left">Item</span>
          {scaleLabels.map((l, i) => (
            <span key={i} className="px-1">{i} — {l}</span>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        {def.items.map((item, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const values = isBinary ? [0, 1] : [0, 1, 2, 3];

          return (
            <div
              key={idx}
              className={cn(
                "rounded-lg border transition-colors",
                isAnswered ? "bg-primary/5 border-primary/20" : "bg-card border-border/60"
              )}
            >
              <div
                className="grid items-center gap-2 px-3 py-2.5"
                style={isBinary
                  ? { gridTemplateColumns: "1fr auto auto" }
                  : { gridTemplateColumns: `1fr repeat(${values.length}, minmax(60px, 80px))` }
                }
              >
                {/* Texte item */}
                <p className="text-xs leading-snug pr-2">
                  <span className="text-[10px] font-bold text-muted-foreground mr-1.5">{idx + 1}.</span>
                  {item}
                </p>

                {/* Boutons réponse */}
                {isBinary ? (
                  <>
                    {scaleLabels.map((label, val) => (
                      <button
                        key={val}
                        onClick={() => setAnswer(idx, val)}
                        className={cn(
                          "text-[11px] font-medium px-3 py-1.5 rounded-md border transition-all",
                          answers[idx] === val
                            ? val === 0
                              ? "bg-green-100 border-green-400 text-green-800"
                              : "bg-orange-100 border-orange-400 text-orange-800"
                            : "bg-muted/50 border-transparent text-muted-foreground hover:border-border"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {values.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAnswer(idx, val)}
                        className={cn(
                          "text-xs font-semibold h-8 rounded-md border transition-all mx-0.5",
                          answers[idx] === val
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-muted/50 border-transparent text-muted-foreground hover:border-border hover:bg-muted"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note spéciale PHQ-9 item 9 */}
      {showSuicidalityAlert && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Item 9 — réponse positive</p>
            <p className="mt-0.5 text-red-700">
              Une réponse non nulle à cet item nécessite une évaluation clinique du risque suicidaire lors du prochain contact.
            </p>
          </div>
        </div>
      )}

      {/* Note EAT-26 item 25 */}
      {def.key === "eat26" && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] text-blue-700">
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>Item 25 est inversé dans le scoring (« J'aime essayer de nouveaux aliments riches »).</span>
        </div>
      )}

      {/* Score live */}
      {complete && band && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Score total</p>
              <p className="text-3xl font-bold tabular-nums">{score}
                <span className="text-base font-normal text-muted-foreground ml-1">/ {def.maxScore}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Niveau</p>
              <span className={cn("text-sm font-bold px-3 py-1.5 rounded-lg", BAND_COLORS[band.color])}>
                {band.label}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">{band.description}</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                band.color === "green" ? "bg-green-500" :
                band.color === "yellow" ? "bg-yellow-500" :
                band.color === "orange" ? "bg-orange-500" :
                band.color === "red" ? "bg-red-500" : "bg-purple-600"
              )}
              style={{ width: `${(score / def.maxScore) * 100}%` }}
            />
          </div>

          {/* Bandes de référence */}
          <div className="mt-3 flex gap-1 flex-wrap">
            {def.bands.map((b) => (
              <span
                key={b.label}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  b.label === band.label
                    ? BAND_COLORS[b.color] + " font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {b.label} ({b.min}–{b.max})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Score partiel */}
      {!complete && answered > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/30" />
          Score partiel : {score} / {def.maxScore} ({answered}/{def.itemCount} items)
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        {onCancel && (
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={onCancel}>
            <ChevronLeft size={13} /> Annuler
          </Button>
        )}
        <Button
          size="sm"
          className="ml-auto gap-1.5"
          disabled={!complete || isSaving}
          onClick={() => complete && onSave(score, answers)}
        >
          <CheckCircle2 size={13} />
          {isSaving ? "Enregistrement…" : complete ? `Enregistrer (${score}/${def.maxScore})` : `${answered}/${def.itemCount} items à répondre`}
        </Button>
      </div>

      {/* Disclaimer légal */}
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Outil de complétude du dossier — l'interprétation clinique reste du ressort du soignant.
      </p>
    </div>
  );
}
