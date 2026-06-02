"use client";

import Link from "next/link";
import { Building2, MapPin, Mail, User2, Clock } from "lucide-react";
import { N, cardStyle } from "@/lib/design-tokens";
import { StatusBadge } from "./StatusBadge";
import { ORG_TYPE_LABEL } from "./orgTypeLabels";
import type { ApplicationListItem } from "@/hooks/useAdminApplications";

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diffMin = Math.round((Date.now() - ts) / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `il y a ${diffD} j`;
}

export function ApplicationCard({
  application,
  showNewBadge = false,
}: {
  application: ApplicationListItem;
  showNewBadge?: boolean;
}) {
  return (
    <Link
      href={`/admin/organization-applications/${application.id}`}
      data-testid="application-card"
      style={{
        ...cardStyle,
        display: "block",
        padding: 18,
        textDecoration: "none",
        color: "inherit",
        transition: `all 0.2s ${N.ease}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = N.shadowHover;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(91,78,196,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = N.shadow;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = N.border;
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: N.dark,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {application.proposedName}
            </h3>
            {showNewBadge && application.status === "PENDING_REVIEW" && (
              <span
                data-testid="new-badge"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: N.primaryLight,
                  color: N.primary,
                  padding: "2px 7px",
                  borderRadius: 4,
                }}
              >
                Nouveau
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
              color: N.textLight,
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Building2 size={12} /> {ORG_TYPE_LABEL[application.proposedType]}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} /> {application.proposedCity}
            </span>
            <span style={{ fontFamily: "var(--font-inter), monospace", fontSize: 11 }}>
              SIRET {application.proposedSiret}
            </span>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${N.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          fontSize: 12,
          color: N.textMid,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <User2 size={12} />
            <strong style={{ fontWeight: 500, color: N.dark }}>
              {application.applicantFirstName} {application.applicantLastName}
            </strong>
            <span style={{ color: N.textLight }}>· {application.applicantRoleInOrg}</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: N.textLight }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Mail size={12} /> {application.applicantEmail}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} /> {formatRelative(application.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
