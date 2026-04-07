"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  BookOpen,
  ClipboardList,
  Stethoscope,
  FileCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DecisionTree, DecisionTreeNode } from "@/lib/data/decision-trees"

interface TreeNavigatorProps {
  tree: DecisionTree
  onClose?: () => void
}

const nodeIcons: Record<DecisionTreeNode["type"], React.ReactNode> = {
  question: <ClipboardList className="size-5" />,
  checklist: <CheckCircle2 className="size-5" />,
  action: <Stethoscope className="size-5" />,
  result: <FileCheck className="size-5" />,
}

const severityConfig = {
  critical: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    badge: "destructive" as const,
    icon: <AlertTriangle className="size-4" />,
    label: "Urgence",
  },
  high: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    badge: "destructive" as const,
    icon: <AlertCircle className="size-4" />,
    label: "Prioritaire",
  },
  moderate: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    badge: "secondary" as const,
    icon: <Info className="size-4" />,
    label: "Modéré",
  },
  low: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
    badge: "outline" as const,
    icon: <CheckCircle2 className="size-4" />,
    label: "Favorable",
  },
}

export function TreeNavigator({ tree, onClose }: TreeNavigatorProps) {
  const [history, setHistory] = useState<string[]>([tree.root])
  const currentNodeId = history[history.length - 1]
  const currentNode = tree.nodes[currentNodeId]

  const navigate = useCallback((nodeId: string) => {
    setHistory((prev) => [...prev, nodeId])
  }, [])

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const reset = useCallback(() => {
    setHistory([tree.root])
  }, [tree.root])

  if (!currentNode) return null

  const severity = currentNode.severity
    ? severityConfig[currentNode.severity]
    : null

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        {onClose ? (
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 shrink-0 text-muted-foreground" />
            <p className="truncate text-sm font-medium">{tree.title}</p>
          </div>
          {/* Breadcrumb */}
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            {history.map((id, i) => {
              const node = tree.nodes[id]
              if (!node) return null
              const label =
                node.text.length > 30
                  ? node.text.slice(0, 30) + "…"
                  : node.text
              return (
                <span key={id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3" />}
                  <button
                    onClick={() => setHistory(history.slice(0, i + 1))}
                    className={cn(
                      "hover:text-foreground transition-colors",
                      i === history.length - 1 && "text-foreground font-medium"
                    )}
                  >
                    {label}
                  </button>
                </span>
              )
            })}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={reset} title="Recommencer">
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Node type badge */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-muted-foreground">
                {nodeIcons[currentNode.type]}
              </span>
              <Badge variant="secondary" className="capitalize">
                {currentNode.type === "question"
                  ? "Question"
                  : currentNode.type === "checklist"
                  ? "Checklist"
                  : currentNode.type === "action"
                  ? "Action"
                  : "Résultat"}
              </Badge>
              {severity && (
                <Badge variant={severity.badge}>
                  {severity.icon}
                  <span className="ml-1">{severity.label}</span>
                </Badge>
              )}
            </div>

            {/* Title */}
            <h2 className="font-heading text-lg font-semibold leading-snug">
              {currentNode.text}
            </h2>

            {/* Info box */}
            {currentNode.info && (
              <div
                className={cn(
                  "mt-3 rounded-lg border p-3 text-sm",
                  severity
                    ? `${severity.bg} ${severity.border} ${severity.text}`
                    : "bg-muted/50 border-border text-muted-foreground"
                )}
              >
                {currentNode.info}
              </div>
            )}

            {/* Sections */}
            {currentNode.sections && (
              <div className="mt-4 space-y-4">
                {currentNode.sections.map((section, i) => (
                  <Card key={i} size="sm">
                    <CardHeader className="border-b">
                      <CardTitle>{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {section.items.map((item, j) => (
                          <li
                            key={j}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Simple items list */}
            {currentNode.items && !currentNode.sections && (
              <ul className="mt-4 space-y-2">
                {currentNode.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Actions list */}
            {currentNode.actions && (
              <div className="mt-4">
                <ul className="space-y-2">
                  {currentNode.actions.map((action, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex gap-2 rounded-lg border p-2.5 text-sm",
                        severity
                          ? `${severity.bg} ${severity.border}`
                          : "bg-muted/30 border-border"
                      )}
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tools (SCOFF, etc.) */}
            {currentNode.tools && (
              <div className="mt-4 space-y-3">
                {currentNode.tools.map((tool, i) => (
                  <Card key={i} size="sm">
                    <CardHeader className="border-b">
                      <CardTitle>{tool.name}</CardTitle>
                      {tool.threshold && (
                        <CardDescription>{tool.threshold}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-1.5">
                        {tool.items.map((item, j) => (
                          <li
                            key={j}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <span className="shrink-0 font-medium text-foreground">
                              {j + 1}.
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Options (navigation) */}
            {currentNode.options && (
              <div className="mt-5 space-y-2">
                {currentNode.options.map((option) => (
                  <button
                    key={option.next}
                    onClick={() => navigate(option.next)}
                    className="nami-card-interactive flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      {option.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* Single next button */}
            {currentNode.next && !currentNode.options && (
              <div className="mt-5">
                <Button onClick={() => navigate(currentNode.next!)} className="w-full">
                  Continuer
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}

            {/* Sources (on result nodes) */}
            {currentNode.type === "result" && !currentNode.next && !currentNode.options && (
              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Sources : {tree.sources.join(" · ")}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      {history.length > 1 && (
        <div className="border-t px-4 py-3">
          <Button variant="outline" size="sm" onClick={goBack} className="w-full">
            <ArrowLeft className="size-4" />
            Retour
          </Button>
        </div>
      )}
    </div>
  )
}
