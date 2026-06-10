"use client";

import { use } from "react";
import { AnimationDashboard } from "@/components/structure/AnimationDashboard";

// Console d'animation — vue admin animateur d'une structure
// (réseau, CPTS, hôpital, fédération, MSP, etc.).
//
// Le layout parent (src/app/(structure)/layout.tsx) gère :
//   - auth guard + redirect ORG_ADMIN
//   - header sticky "Console d'animation"
//   - retour cockpit soignant (si user a un providerProfile)
//
// Cette page rend uniquement le dashboard. Persona = animateur
// non-soignant (Sylvie CPTS Neuilly). Pas de wording clinique,
// pas d'agenda patient.
export default function StructureAdminPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  return <AnimationDashboard orgId={orgId} />;
}
