"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SharedPatient {
  firstName: string;
  lastName: string;
  age: number | null;
  sex: string | null;
}

interface SharedCondition {
  conditionLabel: string;
  conditionCode: string | null;
  status: string | null;
}

interface SharedMember {
  name: string;
  specialty: string;
}

interface SharedNote {
  id: string;
  title: string;
  noteType: string | null;
  createdAt: string;
  author: string;
}

interface SharedObservation {
  metric: string | null;
  value: number | string | null;
  unit: string | null;
  date: string;
}

interface SharedView {
  patient: SharedPatient;
  conditions: SharedCondition[];
  team: SharedMember[];
  notes: SharedNote[];
  observations: SharedObservation[];
  sharedBy: string;
  expiresAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function sexLabel(sex: string | null) {
  if (sex === "M") return "H";
  if (sex === "F") return "F";
  return "";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharedViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SharedView | null>(null);
  const [error, setError] = useState<{ message: string; expired?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://nami-production-f268.up.railway.app";

  useEffect(() => {
    fetch(`${API_URL}/shared/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError({ message: json.error ?? "Erreur inconnue", expired: json.expired });
        } else {
          setData(json as SharedView);
        }
      })
      .catch(() => setError({ message: "Impossible de charger le dossier" }))
      .finally(() => setLoading(false));
  }, [token, API_URL]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-3 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#5B4EC4]">Nami</span>
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-lg bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4A3DB3] transition-colors"
        >
          Créer un compte
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Chargement du dossier…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">{error.expired ? "⏰" : "🔒"}</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {error.expired ? "Ce lien a expiré" : "Lien invalide"}
            </h1>
            <p className="text-sm text-gray-500 mb-6">{error.message}</p>
            <p className="text-sm text-gray-400">
              Demandez un nouveau lien au soignant qui vous a invité.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && data && (
          <>
            {/* Banner lecture seule */}
            <div className="mb-6 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
              <span>👁</span>
              <span>
                <strong>Dossier en lecture seule</strong> · Lien valide jusqu&apos;au{" "}
                {formatDate(data.expiresAt)}
              </span>
            </div>

            {/* En-tête patient */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Dossier partagé —{" "}
                <span className="text-[#5B4EC4]">
                  {data.patient.firstName} {data.patient.lastName}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {[
                  data.patient.age ? `${data.patient.age} ans` : null,
                  sexLabel(data.patient.sex),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <div className="space-y-4">
              {/* Pathologies */}
              {data.conditions.length > 0 && (
                <Section title="Pathologies" icon="🩺">
                  <div className="flex flex-wrap gap-2">
                    {data.conditions.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-[#EDE9FC] text-[#5B4EC4] font-medium"
                      >
                        {c.conditionLabel}
                        {c.conditionCode && (
                          <span className="text-[10px] opacity-60">
                            ({c.conditionCode})
                          </span>
                        )}
                        {c.status === "ACTIVE" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B4EC4] opacity-70" />
                        )}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Équipe */}
              {data.team.length > 0 && (
                <Section title="Équipe de soins" icon="👥">
                  <div className="flex flex-wrap gap-2">
                    {data.team.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#EDE9FC] flex items-center justify-center text-xs font-semibold text-[#5B4EC4]">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-tight">
                            {m.name}
                          </p>
                          {m.specialty && (
                            <p className="text-[11px] text-gray-400">{m.specialty}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Mesures */}
              {data.observations.length > 0 && (
                <Section title="Dernières mesures" icon="📊">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data.observations.map((o, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <p className="text-[11px] text-gray-400 mb-0.5">
                          {o.metric ?? "Mesure"}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {o.value}{" "}
                          {o.unit && (
                            <span className="text-[11px] font-normal text-gray-500">
                              {o.unit}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {o.date
                            ? new Date(o.date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                              })
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Notes */}
              {data.notes.length > 0 && (
                <Section title="Notes récentes" icon="📋">
                  <div className="space-y-2">
                    {data.notes.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {n.title || "Note sans titre"}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {n.author} ·{" "}
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 shrink-0">
                          Contenu masqué
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Le contenu des notes est accessible aux membres de l&apos;équipe
                    connectés.
                  </p>
                </Section>
              )}

              {/* CTA rejoindre */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#5B4EC4] to-[#2BA89C] p-6 text-white text-center">
                <p className="text-lg font-bold mb-1">
                  💜 Rejoignez l&apos;équipe de soins sur Nami
                </p>
                <p className="text-sm text-white/80 mb-5">
                  Créez votre compte pour collaborer sur ce dossier, ajouter des notes
                  et coordonner le parcours en temps réel.
                </p>
                <Link
                  href="/signup"
                  className="inline-block px-6 py-2.5 rounded-xl bg-white text-[#5B4EC4] font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Créer mon compte gratuitement
                </Link>
              </div>

              {/* Footer légal */}
              <p className="text-center text-[11px] text-gray-300 pb-8">
                Nami n&apos;est pas un dispositif médical · Dossier en lecture seule ·
                Données chiffrées en transit
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}
