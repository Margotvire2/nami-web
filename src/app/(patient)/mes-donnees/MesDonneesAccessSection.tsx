import { Eye } from "lucide-react";
import type { User } from "@/lib/api";

/**
 * Art. 15 RGPD — Droit d'accès.
 *
 * Affiche les données du compte connu côté store auth :
 *   - identité (firstName, lastName, email)
 *   - statut compte (roleType, email vérifié ou non)
 *
 * V1 : on n'affiche QUE les champs réellement disponibles dans le store.
 * Pas de date de naissance / téléphone / photo ici car ces champs vivent
 * sur Person.* et non sur le User token — ils sont rectifiables depuis
 * /mon-compte (voir MesDonneesRectifSection).
 *
 * IMPORTANT — frontière de scope :
 * Cette section n'expose AUCUNE donnée saisie par un soignant. Les
 * informations du dossier de coordination relèvent de la responsabilité
 * du professionnel de santé (Art. 28 RGPD, sous-traitance Nami) et doivent
 * lui être demandées directement.
 */
export function MesDonneesAccessSection({ user }: { user: User }) {
  const emailVerified = !!user.emailVerifiedAt;

  return (
    <section
      aria-labelledby="access-heading"
      className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 md:p-8 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(91,78,196,0.08)] flex items-center justify-center shrink-0">
          <Eye className="w-5 h-5 text-[#5B4EC4]" strokeWidth={2} aria-hidden="true" />
        </div>
        <h2
          id="access-heading"
          className="text-xl font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Voir mes données
        </h2>
      </div>

      <p className="text-sm text-[#6B7280] leading-relaxed">
        Art. 15 RGPD — droit d&apos;accès. Voici les données d&apos;identification
        et de compte que Nami conserve à votre sujet.
      </p>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div>
          <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Prénom
          </dt>
          <dd className="mt-1 text-[#1A1A2E] font-medium">{user.firstName}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Nom
          </dt>
          <dd className="mt-1 text-[#1A1A2E] font-medium">{user.lastName}</dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Adresse e-mail
          </dt>
          <dd className="mt-1 text-[#1A1A2E] font-medium break-all">
            {user.email}
            {emailVerified ? (
              <span className="ml-2 text-xs font-normal text-[#059669]">
                (vérifiée)
              </span>
            ) : (
              <span className="ml-2 text-xs font-normal text-[#D97706]">
                (non vérifiée)
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Type de compte
          </dt>
          <dd className="mt-1 text-[#1A1A2E] font-medium">Patient</dd>
        </div>

        <div>
          <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Langue
          </dt>
          <dd className="mt-1 text-[#1A1A2E] font-medium">Français</dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Identifiant interne
          </dt>
          <dd className="mt-1 text-[#6B7280] font-mono text-xs break-all">
            {user.id}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-[#6B7280] leading-relaxed border-t border-[rgba(26,26,46,0.06)] pt-4">
        Les informations relatives à votre dossier de coordination (équipe
        soignante, documents partagés, rendez-vous) sont accessibles depuis
        votre espace Nami. Les données saisies par un professionnel de santé
        relèvent de sa responsabilité de traitement : pour y accéder ou demander
        une correction, contactez directement le soignant concerné.
      </p>
    </section>
  );
}
