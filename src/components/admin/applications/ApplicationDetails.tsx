"use client";

import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  FileText,
  User2,
  Mail,
  Phone,
  IdCard,
  ShieldCheck,
  Calendar,
  StickyNote,
  XCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { N, cardStyle, slStyle } from "@/lib/design-tokens";
import { StatusBadge } from "./StatusBadge";
import { ORG_TYPE_LABEL, TIER_LABEL } from "./orgTypeLabels";
import type { ApplicationDetail } from "@/hooks/useAdminApplications";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: N.textLight, letterSpacing: "0.02em" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: N.dark, wordBreak: "break-word" }}>{children}</span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <section style={{ ...cardStyle, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <Icon size={16} color={N.primary} />
        <h2 style={{ ...slStyle, margin: 0 }}>{title}</h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function ApplicationDetails({ application }: { application: ApplicationDetail }) {
  const fullName = `${application.applicantFirstName} ${application.applicantLastName}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header status */}
      <div
        style={{
          ...cardStyle,
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: N.dark, margin: 0 }}>
            {application.proposedName}
          </h1>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
              color: N.textLight,
              flexWrap: "wrap",
            }}
          >
            <span>{ORG_TYPE_LABEL[application.proposedType]}</span>
            <span>·</span>
            <span>Reçue {formatDate(application.createdAt)}</span>
            {application.reviewedAt && (
              <>
                <span>·</span>
                <span>
                  Reviewée {formatDate(application.reviewedAt)}
                  {application.reviewedBy && (
                    <> par {application.reviewedBy.firstName} {application.reviewedBy.lastName}</>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {/* Section structure proposée */}
      <Section title="Structure proposée" icon={Building2}>
        <Field label="Nom">{application.proposedName}</Field>
        <Field label="Type">{ORG_TYPE_LABEL[application.proposedType]}</Field>
        <Field label="SIRET">
          <span style={{ fontFamily: "var(--font-inter), monospace" }}>
            {application.proposedSiret}
          </span>
        </Field>
        {application.proposedFiness && (
          <Field label="FINESS">
            <span style={{ fontFamily: "var(--font-inter), monospace" }}>
              {application.proposedFiness}
            </span>
          </Field>
        )}
        <Field label="Adresse">
          <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 4 }}>
            <MapPin size={13} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>
              {application.proposedAddress}
              <br />
              {application.proposedZipCode} {application.proposedCity}
              {application.proposedRegion && <> · {application.proposedRegion}</>}
            </span>
          </span>
        </Field>
        {application.proposedSpecialty && (
          <Field label="Spécialité">{application.proposedSpecialty}</Field>
        )}
        {application.proposedTier && (
          <Field label="Offre demandée">{TIER_LABEL[application.proposedTier]}</Field>
        )}
        {application.proposedSince && (
          <Field label="Créée le">{formatDate(application.proposedSince)}</Field>
        )}
        {application.proposedWebsite && (
          <Field label="Site web">
            <a
              href={application.proposedWebsite}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: N.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <Globe size={13} /> {application.proposedWebsite}
            </a>
          </Field>
        )}
      </Section>

      {/* Description + mission */}
      {(application.proposedDescription || application.proposedMissionStatement) && (
        <Section title="Description & mission" icon={FileText}>
          {application.proposedDescription && (
            <Field label="Description">
              <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {application.proposedDescription}
              </span>
            </Field>
          )}
          {application.proposedMissionStatement && (
            <Field label="Mission">
              <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {application.proposedMissionStatement}
              </span>
            </Field>
          )}
        </Section>
      )}

      {/* Section référent */}
      <Section title="Personne référente" icon={User2}>
        <Field label="Nom complet">{fullName}</Field>
        <Field label="Rôle dans la structure">{application.applicantRoleInOrg}</Field>
        <Field label="Email">
          <a
            href={`mailto:${application.applicantEmail}`}
            style={{ color: N.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <Mail size={13} /> {application.applicantEmail}
          </a>
        </Field>
        {application.applicantPhone && (
          <Field label="Téléphone">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Phone size={13} /> {application.applicantPhone}
            </span>
          </Field>
        )}
        <Field label="RPPS déclaré">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IdCard size={13} />
            {application.applicantHasRpps
              ? application.applicantRpps ?? "—"
              : "Non"}
          </span>
        </Field>
      </Section>

      {/* CGU / RGPD traçabilité */}
      <Section title="Consentements CGU & RGPD" icon={ShieldCheck}>
        <Field label="Version CGU acceptée">
          <span style={{ fontFamily: "var(--font-inter), monospace" }}>
            {application.cguVersion}
          </span>
        </Field>
        <Field label="Acceptation CGU">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Calendar size={13} /> {formatDate(application.acceptedTermsAt)}
          </span>
        </Field>
        <Field label="Acceptation RGPD">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Calendar size={13} /> {formatDate(application.acceptedRgpdAt)}
          </span>
        </Field>
      </Section>

      {/* Notes review existantes */}
      {application.reviewNotes && (
        <Section title="Notes de review" icon={StickyNote}>
          <Field label="Notes internes">
            <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {application.reviewNotes}
            </span>
          </Field>
        </Section>
      )}

      {/* Rejet — raison */}
      {application.status === "REJECTED" && application.rejectionReason && (
        <Section title="Motif de rejet" icon={XCircle}>
          <Field label="Raison communiquée à l'applicant">
            <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, color: N.danger }}>
              {application.rejectionReason}
            </span>
          </Field>
        </Section>
      )}

      {/* Approval — entités créées */}
      {application.status === "APPROVED" && (
        <Section title="Entités créées après approbation" icon={CheckCircle2}>
          {application.createdOrganization && (
            <Field label="Organisation">
              <Link
                href={`/structure/${application.createdOrganization.id}`}
                style={{ color: N.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {application.createdOrganization.name}
                <ExternalLink size={12} />
              </Link>
            </Field>
          )}
          {application.createdAdminPerson && (
            <Field label="Administrateur structure">
              <Link
                href={`/admin/utilisateurs?personId=${application.createdAdminPerson.id}`}
                style={{ color: N.primary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {application.createdAdminPerson.firstName} {application.createdAdminPerson.lastName}
                <ExternalLink size={12} />
              </Link>
            </Field>
          )}
          {application.approvedAt && (
            <Field label="Approuvée le">{formatDate(application.approvedAt)}</Field>
          )}
        </Section>
      )}

      {/* Withdrawal */}
      {application.status === "WITHDRAWN" && application.withdrawnAt && (
        <Section title="Candidature retirée" icon={XCircle}>
          <Field label="Date de retrait">{formatDate(application.withdrawnAt)}</Field>
        </Section>
      )}
    </div>
  );
}
