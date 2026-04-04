/**
 * Registre central de la timeline Nami.
 *
 * Un seul endroit pour définir : icône, couleur, label, catégorie,
 * et visibilité par défaut de chaque type d'événement.
 *
 * Pour ajouter un nouveau type : une seule ligne ici, et il apparaît
 * automatiquement dans toutes les vues (détail, trajectoire, filtres, légende).
 */

import {
  Stethoscope,
  FileText,
  AlertTriangle,
  CheckSquare,
  ArrowLeftRight,
  CheckCircle2,
  Users,
  Flag,
  Sparkles,
  Heart,
  BookOpen,
  MessageSquare,
  CalendarDays,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEventType, TimelineCategory } from "./model";

// ─── Définition d'une entrée du registre ─────────────────────────────────────

export interface TimelineRegistryEntry {
  /** Icône Lucide */
  icon: LucideIcon;
  /** Couleur Tailwind pour la node (bg-*-500) */
  nodeColor: string;
  /** Couleur Tailwind pour le ring de sélection */
  ringColor: string;
  /** Couleur Tailwind pour la vue liste (bg + border + text) */
  listStyle: string;
  /** Label court en français */
  label: string;
  /** Catégorie UI (pour les filtres) */
  category: TimelineCategory;
  /** Visible sur la frise trajectoire par défaut */
  trajectoryVisible: boolean;
  /** Cliniquement important par défaut */
  clinicallyImportant: boolean;
}

// ─── Le registre ─────────────────────────────────────────────────────────────

export const TIMELINE_REGISTRY: Record<TimelineEventType, TimelineRegistryEntry> = {
  consultation: {
    icon: Stethoscope,
    nodeColor: "bg-emerald-500",
    ringColor: "ring-emerald-200",
    listStyle: "bg-emerald-50 border-emerald-200 text-emerald-700",
    label: "Consultation",
    category: "consultation",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  clinical_note: {
    icon: FileText,
    nodeColor: "bg-blue-500",
    ringColor: "ring-blue-200",
    listStyle: "bg-blue-50 border-blue-200 text-blue-700",
    label: "Note clinique",
    category: "note",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  document: {
    icon: FileText,
    nodeColor: "bg-slate-500",
    ringColor: "ring-slate-200",
    listStyle: "bg-slate-50 border-slate-200 text-slate-600",
    label: "Document",
    category: "document",
    trajectoryVisible: false,
    clinicallyImportant: false,
  },
  alert: {
    icon: AlertTriangle,
    nodeColor: "bg-red-500",
    ringColor: "ring-red-200",
    listStyle: "bg-red-50 border-red-200 text-red-600",
    label: "Alerte",
    category: "alert",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  task: {
    icon: CheckSquare,
    nodeColor: "bg-purple-500",
    ringColor: "ring-purple-200",
    listStyle: "bg-purple-50 border-purple-200 text-purple-700",
    label: "Tâche",
    category: "task",
    trajectoryVisible: false,
    clinicallyImportant: false,
  },
  referral_created: {
    icon: ArrowLeftRight,
    nodeColor: "bg-amber-500",
    ringColor: "ring-amber-200",
    listStyle: "bg-amber-50 border-amber-200 text-amber-700",
    label: "Adressage envoyé",
    category: "coordination",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  referral_accepted: {
    icon: CheckCircle2,
    nodeColor: "bg-amber-600",
    ringColor: "ring-amber-200",
    listStyle: "bg-amber-50 border-amber-200 text-amber-700",
    label: "Adressage accepté",
    category: "coordination",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  journal_entry: {
    icon: Heart,
    nodeColor: "bg-indigo-500",
    ringColor: "ring-indigo-200",
    listStyle: "bg-indigo-50 border-indigo-200 text-indigo-700",
    label: "Signal patient",
    category: "patient",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  care_team_change: {
    icon: Users,
    nodeColor: "bg-violet-500",
    ringColor: "ring-violet-200",
    listStyle: "bg-violet-50 border-violet-200 text-violet-700",
    label: "Équipe",
    category: "coordination",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  risk_change: {
    icon: Flag,
    nodeColor: "bg-red-600",
    ringColor: "ring-red-200",
    listStyle: "bg-red-50 border-red-200 text-red-700",
    label: "Risque modifié",
    category: "alert",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  care_plan_update: {
    icon: Sparkles,
    nodeColor: "bg-primary",
    ringColor: "ring-primary/20",
    listStyle: "bg-primary/5 border-primary/20 text-primary",
    label: "Plan de soin",
    category: "coordination",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  message: {
    icon: MessageSquare,
    nodeColor: "bg-sky-500",
    ringColor: "ring-sky-200",
    listStyle: "bg-sky-50 border-sky-200 text-sky-700",
    label: "Message",
    category: "coordination",
    trajectoryVisible: false,
    clinicallyImportant: false,
  },
  milestone: {
    icon: Flag,
    nodeColor: "bg-primary",
    ringColor: "ring-primary/30",
    listStyle: "bg-primary/5 border-primary/20 text-primary",
    label: "Étape clé",
    category: "coordination",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  phase_change: {
    icon: Activity,
    nodeColor: "bg-primary",
    ringColor: "ring-primary/20",
    listStyle: "bg-primary/5 border-primary/20 text-primary",
    label: "Changement de phase",
    category: "coordination",
    trajectoryVisible: true,
    clinicallyImportant: true,
  },
  other: {
    icon: Activity,
    nodeColor: "bg-muted-foreground",
    ringColor: "ring-muted",
    listStyle: "bg-muted border-border text-muted-foreground",
    label: "Événement",
    category: "consultation",
    trajectoryVisible: false,
    clinicallyImportant: false,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getRegistryEntry(type: TimelineEventType): TimelineRegistryEntry {
  return TIMELINE_REGISTRY[type] ?? TIMELINE_REGISTRY.other;
}

/** Catégories pour les filtres UI */
export const TIMELINE_CATEGORIES: { key: string; label: string; categories: TimelineCategory[] }[] = [
  { key: "tout",          label: "Tout",           categories: [] },
  { key: "consultation",  label: "Consultations",  categories: ["consultation"] },
  { key: "note",          label: "Notes",           categories: ["note"] },
  { key: "document",      label: "Documents",       categories: ["document"] },
  { key: "patient",       label: "Patient",         categories: ["patient"] },
  { key: "alerte",        label: "Alertes",         categories: ["alert"] },
  { key: "tache",         label: "Tâches",          categories: ["task"] },
  { key: "coordination",  label: "Coordination",    categories: ["coordination"] },
];
