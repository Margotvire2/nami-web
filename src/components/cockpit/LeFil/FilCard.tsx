"use client";
import type { DashboardConsultation } from "@/hooks/useDashboard";
import type { TaskWithContext, Referral, ConnectionRequest } from "@/lib/api";

// ── FilCardConsult ──────────────────────────────────────────────────────────

const ACCENT: Record<string, string> = {
  premiere: "var(--warning)",
  teleconsult: "var(--teal-deep)",
  suivi: "var(--violet)",
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
  const accent = ACCENT[c.type] ?? "var(--violet)";
  const isTele = c.type === "teleconsult";
  const isFirst = c.type === "premiere";
  const isPast = c.status === "past";

  return (
    <article
      data-fil-item="consult"
      className={`event consult${selected ? " attn" : ""}${isPast ? " opacity-50" : ""}`}
      style={{ "--accent": accent, cursor: "pointer" } as React.CSSProperties}
      onClick={onSelect}
    >
      <span className="accent" />
      <div className="timecol">
        <span className="hr">{c.time}</span>
        <span className="dur">{c.duration}</span>
        <span className="loc">
          {isTele ? (
            <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: "var(--ink-3)", strokeWidth: 1.7, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }}>
              <rect x="3" y="7" width="12" height="10" rx="2" /><path d="M15 10l5-3v10l-5-3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: "var(--ink-3)", strokeWidth: 1.7, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" />
            </svg>
          )}
          {isTele ? "Téléconsult." : "Cabinet"}
        </span>
      </div>
      <div className="cbody">
        <div className="ev-top">
          <h3 className="ev-title">
            {isFirst ? "Première consultation · nouvelle personne" : c.patient}
          </h3>
          {isFirst ? (
            <span className="tag" style={{ borderColor: "var(--warning-tint)", color: "var(--warning)", background: "var(--warning-tint)" }}>Premier contact</span>
          ) : (
            <span className="tag path">{c.typeLabel}</span>
          )}
        </div>
        <p className="ev-sub">
          {isFirst
            ? "Adressée par votre réseau · parcours à ouvrir. Un guide vous accompagnera pour structurer le dossier."
            : `${c.detail.age > 0 ? `${c.detail.age} ans · ` : ""}${c.mode}`}
        </p>
        <div className="ev-foot">
          <div className="act2">
            {c.careCaseId && (
              <button
                className="btn btn-ghost btn-mini"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrep();
                }}
              >
                Préparer
              </button>
            )}
            <button
              className="btn btn-primary btn-mini"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
              </svg>
              Démarrer
            </button>
          </div>
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
  const today = new Date();
  const isOverdue = task.dueDate && new Date(task.dueDate) < today;
  const { cls, label } = TTYPE_FOR_PRIORITY[task.priority] ?? { cls: "coord", label: "À faire" };
  const patient = task.careCase?.patient;

  return (
    <article data-fil-item="task" className="event task">
      <button
        className="check"
        aria-label="Valider la tâche"
        onClick={onComplete}
        style={{ cursor: "pointer", flexShrink: 0 }}
      />
      <div className="tbody">
        <span className={`ttype ${cls}`}>{label}</span>
        <div className="ev-top">
          <h3 className="ev-title">{task.title}</h3>
          {isOverdue && (
            <span className="tag" style={{ borderColor: "var(--critical)", color: "var(--critical)", background: "var(--surface-2)" }}>
              En retard
            </span>
          )}
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
// Simplified inline accept/decline — full detail at /adressages.

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
          <span className="tag">Réseau</span>
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
// Patient connection request (demande de suivi).

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
