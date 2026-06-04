"use client";

/**
 * F-COCKPIT-PATIENT-360-REFONTE — QuickActionsBar
 *
 * 3 actions rapides en header :
 *   - Nouveau RDV     → callback onScheduleAppointment (sinon disabled, tooltip "Bientôt")
 *   - Envoyer un message → callback onSendMessage      (sinon disabled, tooltip "Bientôt")
 *   - Ajouter un document → callback onAddDocument     (sinon disabled, tooltip "Bientôt")
 *
 * Le wiring concret (modale, navigation) reste à la charge de la page —
 * QuickActionsBar ne sait rien des flows.
 */

import { CalendarPlus, FilePlus2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onScheduleAppointment?: () => void;
  onSendMessage?: () => void;
  onAddDocument?: () => void;
  className?: string;
}

interface ActionDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  handler?: () => void;
  testId: string;
}

export function QuickActionsBar({
  onScheduleAppointment,
  onSendMessage,
  onAddDocument,
  className,
}: Props) {
  const actions: ActionDef[] = [
    {
      key: "appointment",
      label: "Nouveau RDV",
      icon: <CalendarPlus size={14} />,
      handler: onScheduleAppointment,
      testId: "quick-action-appointment",
    },
    {
      key: "message",
      label: "Envoyer un message",
      icon: <MessageSquare size={14} />,
      handler: onSendMessage,
      testId: "quick-action-message",
    },
    {
      key: "document",
      label: "Ajouter un document",
      icon: <FilePlus2 size={14} />,
      handler: onAddDocument,
      testId: "quick-action-document",
    },
  ];

  return (
    <div
      data-testid="quick-actions-bar"
      className={cn("flex items-center gap-1.5", className)}
    >
      {actions.map((action) => {
        const disabled = !action.handler;
        return (
          <button
            key={action.key}
            type="button"
            onClick={action.handler}
            disabled={disabled}
            title={disabled ? "Bientôt" : action.label}
            data-testid={action.testId}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              disabled
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
            )}
          >
            <span aria-hidden="true">{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
