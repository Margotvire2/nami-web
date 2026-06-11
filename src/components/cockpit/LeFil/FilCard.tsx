"use client";
import { useState } from "react";
import type { DashboardConsultation } from "@/hooks/useDashboard";
import type { TaskWithContext, Referral, ConnectionRequest } from "@/lib/api";

// ── FilCardConsult ──────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  premiere: { bg: "rgba(199,122,18,0.08)", color: "var(--warning)", border: "rgba(199,122,18,0.2)" },
  teleconsult: { bg: "rgba(31,159,146,0.08)", color: "var(--teal-deep)", border: "rgba(31,159,146,0.2)" },
  suivi: { bg: "rgba(91,78,196,0.08)", color: "var(--violet)", border: "rgba(91,78,196,0.15)" },
};

export function FilCardConsult({
  c,
  selected,
  onSelect,
  onStart,
  onPrep,
}: {
  c: DashboardConsultation;
  selected: boolean;
  onSelect: () => void;
  onStart: () => void;
  onPrep: () => void;
}) {
  const isTele = c.type === "teleconsult";
  const isFirst = c.type === "premiere";
  const isPast = c.status === "past";
  const badge = TYPE_BADGE[c.type] ?? TYPE_BADGE.suivi;

  return (
    <article
      data-fil-item="consult"
      className={`event consult${selected ? " attn" : ""}${isPast ? " opacity-50" : ""}`}
      style={{ cursor: "pointer" }}
      onClick={onSelect}
    >
      {/* Header row: time chip + type badge */}
      <div className="chead">
        <div className="time-chip">
          <span className="hr">{c.time}</span>
          <span className="dur">{c.duration}</span>
          <span className="loc">
            {isTele ? (
              <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="12" height="10" rx="2" /><path d="M15 10l5-3v10l-5-3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" />
              </svg>
            )}
            {isTele ? "Téléconsult." : "Cabinet"}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 100,
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {isFirst ? "Premier contact" : c.typeLabel}
        </span>
      </div>

      {/* Patient name */}
      <h3 className="ev-title">
        {isFirst ? "Première consultation · nouvelle personne" : c.patient}
      </h3>

      {/* Sub */}
      <p className="ev-sub" style={{ marginTop: 4 }}>
        {isFirst
          ? "Adressée par votre réseau · parcours à ouvrir."
          : `${c.detail.age > 0 ? `${c.detail.age} ans · ` : ""}${c.mode}`}
      </p>

      {/* Actions */}
      <div className="ev-foot">
        <div className="act2">
          {c.careCaseId && (
            <button
              className="btn btn-ghost btn-mini"
              onClick={(e) => { e.stopPropagation(); onPrep(); }}
            >
              Préparer
            </button>
          )}
          <button
            className="btn btn-primary btn-mini"
            onClick={(e) => { e.stopPropagation(); onStart(); }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
            </svg>
            Démarrer
          </button>
        </div>
      </div>
    </article>
  );
}

// ── FilCardTask ──────────────────────────────────────────────────────────────

const TTYPE_FOR_PRIORITY: Record<string, { cls: string; label: string }> = {
  URGENT: { cls: "adr", label: "Urgent" },
  HIGH: { cls: "adr", label: "Prioritaire" },
  MEDIUM: { cls: "coord", label: "À faire" },
  LOW: { cls: "cr", label: "À faire" },
};

export function FilCardTask({
  task,
  onComplete,
  onNavigate,
}: {
  task: TaskWithContext;
  onComplete: () => void;
  onNavigate: () => void;
}) {
  const [done, setDone] = useState(false);
  const today = new Date();
  const isOverdue = task.dueDate && new Date(task.dueDate) < today;
  const { cls, label } = TTYPE_FOR_PRIORITY[task.priority] ?? { cls: "coord", label: "À faire" };
  const patient = task.careCase?.patient;

  function handleComplete() {
    setDone(true);
    onComplete();
  }

  return (
    <article
      data-fil-item="task"
      className="event task"
      style={{ opacity: done ? 0.45 : 1, transition: "opacity .3s var(--ease)" }}
    >
      <button
        className="check"
        aria-label="Valider la tâche"
        onClick={handleComplete}
        disabled={done}
        style={{
          cursor: done ? "default" : "pointer",
          flexShrink: 0,
          background: done ? "var(--violet)" : "var(--surface)",
          borderColor: done ? "var(--violet)" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {done && (
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </button>
      <div className="tbody">
        <span className={`ttype ${cls}`}>{label}</span>
        <div className="ev-top">
          <h3 className="ev-title">{task.title}</h3>
          {isOverdue && <span className="tag-late">En retard</span>}
        </div>
        {patient && (
          <p className="ev-sub">
            {patient.firstName} {patient.lastName}
            {task.dueDate && (
              <> · Échéance {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</>
            )}
          </p>
        )}
        <div className="ev-foot">
          <div className="act2">
            {task.careCase?.id && (
              <button className="btn btn-ghost btn-mini" onClick={onNavigate}>
                Ouvrir le dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ── FilCardReferral ──────────────────────────────────────────────────────────

export function FilCardReferral({
  referral,
  onAccept,
  onDecline,
}: {
  referral: Referral;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const sender = referral.sender;
  const caseTitle = referral.careCase.caseTitle;

  return (
    <article data-fil-item="task" className="event task">
      <span className="check" />
      <div className="tbody">
        <span className="ttype coord">Demande de coordination</span>
        <div className="ev-top">
          <h3 className="ev-title">
            {sender.firstName} {sender.lastName} vous adresse {caseTitle}
          </h3>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 100,
              background: "var(--violet-tint)",
              color: "var(--violet)",
              border: "1px solid rgba(91,78,196,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            Réseau
          </span>
        </div>
        <p className="ev-sub">{referral.clinicalReason}</p>
        <div className="ev-foot">
          <div className="act2">
            <button className="btn btn-ghost btn-mini" onClick={onDecline}>Décliner</button>
            <button className="btn btn-primary btn-mini" onClick={onAccept}>Accepter</button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── FilCardRequest ────────────────────────────────────────────────────────────

export function FilCardRequest({
  request,
  onAccept,
  onDecline,
}: {
  request: ConnectionRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <article data-fil-item="task" className="event task">
      <span className="check" />
      <div className="tbody">
        <span className="ttype coord">Demande de suivi</span>
        <div className="ev-top">
          <h3 className="ev-title">
            {request.patient?.firstName} {request.patient?.lastName} souhaite vous rejoindre
          </h3>
        </div>
        <p className="ev-sub">{request.reason || "Demande de suivi"}</p>
        <div className="ev-foot">
          <div className="act2">
            <button className="btn btn-ghost btn-mini" onClick={onDecline}>Décliner</button>
            <button className="btn btn-primary btn-mini" onClick={onAccept}>Accepter</button>
          </div>
        </div>
      </div>
    </article>
  );
}
