"use client";

import { Settings, Stethoscope, Info, ShieldCheck } from "lucide-react";
import MyLinksSection from "../_components/MyLinksSection";
import { N } from "@/lib/design-tokens";

const GUIDE = [
  {
    icon: Stethoscope,
    title: "Rattachement soignant",
    desc: "Un rattachement vous donne accès à l'agenda et aux outils d'un soignant précis.",
  },
  {
    icon: ShieldCheck,
    title: "Périmètre limité",
    desc: "Vous ne voyez que les coordonnées et rendez-vous — jamais les notes cliniques.",
  },
  {
    icon: Info,
    title: "Comment en créer un ?",
    desc: "Demandez au soignant de vous inviter depuis ses réglages → Secrétariat.",
  },
];

export default function SecretariatSettingsPage() {
  return (
    <div className="min-h-screen" style={{ background: N.bg }}>
      <header className="flex items-center px-6 py-4 bg-white border-b border-[#E8ECF4]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: N.statusConfirmedBg }}
          >
            <Settings size={18} style={{ color: N.statusConfirmed }} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-tight" style={{ color: N.ink }}>
              Paramètres
            </h1>
            <p className="text-[11px]" style={{ color: N.ink3 }}>
              Mes rattachements aux soignants
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-6 px-6 py-6">
        {/* Main — liste des rattachements */}
        <div className="flex-1 min-w-0">
          <MyLinksSection />
        </div>

        {/* Rail droit — guide */}
        <aside className="w-64 shrink-0 space-y-3">
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: N.ink3 }}
          >
            Guide
          </p>
          {GUIDE.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl px-4 py-3"
              style={{ background: N.surface, border: `1px solid ${N.border}` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} style={{ color: N.statusConfirmed }} />
                <p className="text-[12px] font-semibold" style={{ color: N.ink }}>
                  {title}
                </p>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: N.ink3 }}>
                {desc}
              </p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
