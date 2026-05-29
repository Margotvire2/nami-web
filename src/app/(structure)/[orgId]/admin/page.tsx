"use client";

import { use } from "react";
import { Construction, Users, FileText, Activity } from "lucide-react";

// SKELETON — la page complète est livrée par F-STRUCT-V1-CONSOLE-ANIMATION.
// Cette version minimale rend la route navigable depuis le switcher, valide
// le routing post-login pour les ORG_ADMIN purs et documente les sections
// attendues (organisation, adhésions, indicateurs de complétude).
export default function StructureAdminPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1
          className="text-2xl font-bold text-[#0F172A]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Console d&apos;animation
        </h1>
        <p className="text-sm text-[#6B7280]">
          Organisation <code className="text-[#5B4EC4]">{orgId}</code>
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#E8ECF4] bg-white px-6 py-10 text-center space-y-4">
        <Construction size={28} className="mx-auto text-[#5B4EC4]" />
        <div className="space-y-1">
          <h2 className="font-semibold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
            Console en construction
          </h2>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto">
            La console d&apos;animation complète est livrée par l&apos;initiative
            F-STRUCT-V1-CONSOLE-ANIMATION. Cette route est déjà navigable depuis
            le switcher header pour valider le routing post-login multi-casquette.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SectionPlaceholder
          icon={<Users size={16} />}
          title="Adhésions"
          description="Valider les demandes, gérer le lifecycle des membres."
        />
        <SectionPlaceholder
          icon={<Activity size={16} />}
          title="Indicateurs"
          description="Indicateurs de complétude d&apos;organisation, non cliniques."
        />
        <SectionPlaceholder
          icon={<FileText size={16} />}
          title="Documents partagés"
          description="Ressources documentaires de l&apos;organisation."
        />
      </div>
    </div>
  );
}

function SectionPlaceholder({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E8ECF4] bg-white px-4 py-5 space-y-2">
      <div className="flex items-center gap-2 text-[#5B4EC4]">
        {icon}
        <h3 className="font-semibold text-sm text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
          {title}
        </h3>
      </div>
      <p className="text-xs text-[#6B7280]">{description}</p>
    </div>
  );
}
