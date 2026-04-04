/**
 * Registre central de la timeline Nami.
 * Chaque type a : emoji sémantique, couleur désaturée, label, catégorie.
 */

import {
  Stethoscope, FileText, AlertTriangle, CheckSquare,
  ArrowLeftRight, CheckCircle2, Users, Flag, Sparkles,
  Heart, MessageSquare, Activity,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEventType, TimelineCategory } from "./model";

export interface TimelineRegistryEntry {
  icon: LucideIcon;
  emoji: string;
  nodeColor: string;
  ringColor: string;
  listStyle: string;
  label: string;
  category: TimelineCategory;
  trajectoryVisible: boolean;
  clinicallyImportant: boolean;
}

export const TIMELINE_REGISTRY: Record<TimelineEventType, TimelineRegistryEntry> = {
  consultation: {
    icon: Stethoscope, emoji: "🩺",
    nodeColor: "bg-[#059669]", ringColor: "ring-[#BBF7D0]",
    listStyle: "bg-[#F0FDF4] border-[#BBF7D0] text-[#065F46]",
    label: "Consultation", category: "consultation",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  clinical_note: {
    icon: FileText, emoji: "📋",
    nodeColor: "bg-[#2563EB]", ringColor: "ring-[#BFDBFE]",
    listStyle: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
    label: "Note clinique", category: "note",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  document: {
    icon: FileText, emoji: "📄",
    nodeColor: "bg-[#64748B]", ringColor: "ring-[#CBD5E1]",
    listStyle: "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]",
    label: "Document", category: "document",
    trajectoryVisible: false, clinicallyImportant: false,
  },
  alert: {
    icon: AlertTriangle, emoji: "🚨",
    nodeColor: "bg-[#DC2626]", ringColor: "ring-[#FECACA]",
    listStyle: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
    label: "Alerte", category: "alert",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  task: {
    icon: CheckSquare, emoji: "✅",
    nodeColor: "bg-[#7C3AED]", ringColor: "ring-[#DDD6FE]",
    listStyle: "bg-[#F5F3FF] border-[#DDD6FE] text-[#5B21B6]",
    label: "Tâche", category: "task",
    trajectoryVisible: false, clinicallyImportant: false,
  },
  referral_created: {
    icon: ArrowLeftRight, emoji: "📤",
    nodeColor: "bg-[#D97706]", ringColor: "ring-[#FDE68A]",
    listStyle: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
    label: "Adressage envoyé", category: "coordination",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  referral_accepted: {
    icon: CheckCircle2, emoji: "📥",
    nodeColor: "bg-[#059669]", ringColor: "ring-[#BBF7D0]",
    listStyle: "bg-[#F0FDF4] border-[#BBF7D0] text-[#065F46]",
    label: "Adressage accepté", category: "coordination",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  journal_entry: {
    icon: Heart, emoji: "💬",
    nodeColor: "bg-[#4F46E5]", ringColor: "ring-[#C7D2FE]",
    listStyle: "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]",
    label: "Signal patient", category: "patient",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  care_team_change: {
    icon: Users, emoji: "👥",
    nodeColor: "bg-[#7C3AED]", ringColor: "ring-[#DDD6FE]",
    listStyle: "bg-[#F5F3FF] border-[#DDD6FE] text-[#5B21B6]",
    label: "Équipe", category: "coordination",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  risk_change: {
    icon: Flag, emoji: "⚠️",
    nodeColor: "bg-[#DC2626]", ringColor: "ring-[#FECACA]",
    listStyle: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
    label: "Risque modifié", category: "alert",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  care_plan_update: {
    icon: Sparkles, emoji: "🤝",
    nodeColor: "bg-[#4F46E5]", ringColor: "ring-[#C7D2FE]",
    listStyle: "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]",
    label: "Plan de soin", category: "coordination",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  message: {
    icon: MessageSquare, emoji: "💬",
    nodeColor: "bg-[#0EA5E9]", ringColor: "ring-[#BAE6FD]",
    listStyle: "bg-[#F0F9FF] border-[#BAE6FD] text-[#0C4A6E]",
    label: "Message", category: "coordination",
    trajectoryVisible: false, clinicallyImportant: false,
  },
  milestone: {
    icon: Flag, emoji: "🏁",
    nodeColor: "bg-[#4F46E5]", ringColor: "ring-[#C7D2FE]",
    listStyle: "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]",
    label: "Étape clé", category: "coordination",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  phase_change: {
    icon: Activity, emoji: "📅",
    nodeColor: "bg-[#4F46E5]", ringColor: "ring-[#C7D2FE]",
    listStyle: "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]",
    label: "Changement de phase", category: "coordination",
    trajectoryVisible: true, clinicallyImportant: true,
  },
  other: {
    icon: Activity, emoji: "📌",
    nodeColor: "bg-[#94A3B8]", ringColor: "ring-[#CBD5E1]",
    listStyle: "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]",
    label: "Événement", category: "consultation",
    trajectoryVisible: false, clinicallyImportant: false,
  },
};

export function getRegistryEntry(type: TimelineEventType): TimelineRegistryEntry {
  return TIMELINE_REGISTRY[type] ?? TIMELINE_REGISTRY.other;
}

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
