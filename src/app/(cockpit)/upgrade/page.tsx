"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  Sparkles,
  Users,
  Brain,
  BarChart3,
  Loader2,
  ArrowLeft,
  Zap,
  Video,
  Network,
} from "lucide-react";
import Link from "next/link";

// ─── Trigger messages ───────────────────────────────────────────────────────

const TRIGGER_MESSAGES: Record<string, string> = {
  referral_received:
    "Vous avez reçu un adressage. Accédez au dossier complet avec Nami Coordination.",
  create_patient:
    "Créez votre premier dossier et commencez à coordonner votre équipe.",
  use_ai:
    "Utilisez l'IA clinique pour extraire les bilans et analyser les repas.",
  send_referral:
    "Envoyez des adressages à votre réseau avec Nami Coordination.",
};

// ─── Tier config ────────────────────────────────────────────────────────────

const TIERS = [
  {
    key: "FREE",
    name: "Gratuit",
    price: "0",
    description: "Agenda, RDV, messagerie — pour démarrer",
    icon: Zap,
    features: [
      "Agenda et prise de RDV",
      "Référencement annuaire 582K professionnels",
      "Messagerie patients",
      "Messagerie soignants & téléexpertise",
      "3 patients actifs",
    ],
    highlight: false,
  },
  {
    key: "ESSENTIEL",
    name: "Découverte",
    price: "19",
    description: "Visio, téléconsultation et facturation incluses",
    icon: Video,
    features: [
      "Tout Gratuit +",
      "Visio / téléconsultation (0% commission)",
      "Facturation non-médecin",
      "Agenda partagé cabinet",
    ],
    highlight: false,
  },
  {
    key: "COORDINATION",
    name: "Coordination",
    price: "79",
    description: "Patients illimités, app patient, adressages structurés",
    icon: Users,
    features: [
      "Tout Découverte +",
      "Dossiers patients illimités",
      "Timeline clinique partagée",
      "App patient incluse",
      "Adressages structurés illimités",
      "Pathway templates TCA, obésité…",
    ],
    highlight: true,
  },
  {
    key: "INTELLIGENCE",
    name: "Intelligence",
    price: "149",
    description: "Synthèses IA sourcées, extraction bio, base 22K entrées",
    icon: Brain,
    features: [
      "Tout Coordination +",
      "Synthèses IA sourcées (brouillon à valider)",
      "Extraction de bilans biologiques",
      "Analyse des photos de repas",
      "Base documentaire 22K entrées médicales",
      "App soignant mobile complète",
    ],
    highlight: false,
  },
  {
    key: "PILOTAGE",
    name: "Pilotage",
    price: "299",
    description: "Pour équipes hospitalières — analytics et multi-équipes",
    icon: BarChart3,
    features: [
      "Tout Intelligence +",
      "Vue pilote avancement parcours",
      "Dashboard KPIs structure",
      "Multi-équipes & multi-sites",
      "Analytics financiers structures",
    ],
    highlight: false,
  },
  {
    key: "RESEAU",
    name: "Réseau",
    price: "499",
    description: "Infrastructure réseau de soins · + 79€/utilisateur supplémentaire",
    icon: Network,
    features: [
      "Tout Pilotage +",
      "Configuration parcours HAS sur mesure",
      "Admin & accès multi-niveaux",
      "SLA prioritaire & onboarding dédié",
    ],
    highlight: false,
  },
];

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const trigger = searchParams.get("trigger") ?? undefined;
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [activating, setActivating] = useState<string | null>(null);

  const triggerMessage = trigger ? TRIGGER_MESSAGES[trigger] : null;

  async function handleActivate(tier: string) {
    setActivating(tier);
    try {
      const result = await api.subscriptions.activate(tier, trigger);
      toast.success(result.message);
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la demande");
    } finally {
      setActivating(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-muted/10">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} /> Retour
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium mb-4">
            <Sparkles size={12} /> Premier mois offert
          </div>
          <h1 className="text-2xl font-semibold">
            Choisissez votre offre Nami
          </h1>
          {triggerMessage && (
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              {triggerMessage}
            </p>
          )}
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`rounded-xl border p-5 flex flex-col ${
                tier.highlight
                  ? "border-primary/30 bg-card shadow-[0_2px_12px_rgba(79,70,229,0.08)] ring-1 ring-primary/10"
                  : "border-border bg-card"
              }`}
            >
              {tier.highlight && (
                <span className="text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded self-start mb-3">
                  Recommandé
                </span>
              )}

              <div className="flex items-center gap-2 mb-1">
                <tier.icon size={18} className="text-primary" />
                <h3 className="text-sm font-semibold">{tier.name}</h3>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {tier.description}
              </p>

              <div className="mb-4">
                <span className="text-2xl font-bold">{tier.price}€</span>
                <span className="text-xs text-muted-foreground">/mois</span>
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check
                      size={14}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                variant={tier.highlight ? "default" : "outline"}
                className="w-full text-xs"
                disabled={activating !== null}
                onClick={() => handleActivate(tier.key)}
              >
                {activating === tier.key ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1.5" />{" "}
                    Envoi…
                  </>
                ) : (
                  `Activer ${tier.name} — Premier mois offert`
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Annulable à tout moment. Intégration Stripe bientôt disponible.
        </p>
      </div>
    </div>
  );
}
