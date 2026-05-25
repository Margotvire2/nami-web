import { Trash2, AlertTriangle } from "lucide-react";

/**
 * Art. 17 RGPD — Droit à l'effacement.
 *
 * Section "danger zone" qui déclenche l'ouverture de DeleteAccountModal
 * (composant réutilisé depuis PR #64, géré par page-client).
 *
 * Wording aligné avec le modal :
 *   - "définitif et irréversible"
 *   - "anonymisées conformément au RGPD (Art. 17)"
 *
 * UX :
 *   - encart rouge léger pour signaler la criticité
 *   - bouton rouge primaire, focus ring rouge cohérent
 *   - rappel "exporter avant" avec ancre #export
 */
export function MesDonneesDeleteSection({
  onRequestDelete,
}: {
  onRequestDelete: () => void;
}) {
  return (
    <section
      aria-labelledby="delete-heading"
      className="bg-white rounded-2xl border border-[rgba(217,38,38,0.18)] p-6 md:p-8 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(217,38,38,0.08)] flex items-center justify-center shrink-0">
          <Trash2
            className="w-5 h-5 text-[#DC2626]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <h2
          id="delete-heading"
          className="text-xl font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Supprimer mon compte
        </h2>
      </div>

      <p className="text-sm text-[#6B7280] leading-relaxed">
        Art. 17 RGPD — droit à l&apos;effacement. La suppression de votre compte
        anonymise définitivement vos données personnelles dans Nami.
      </p>

      <div
        role="note"
        className="flex gap-3 p-4 rounded-xl border border-[rgba(217,38,38,0.2)] bg-[rgba(217,38,38,0.05)]"
      >
        <AlertTriangle
          className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5"
          strokeWidth={2}
          aria-hidden="true"
        />
        <div className="text-sm text-[#1A1A2E] leading-relaxed space-y-2">
          <p>
            Cette action est <strong>définitive et irréversible</strong>. Vos
            données seront anonymisées sous 30 jours conformément à l&apos;article
            17 du RGPD.
          </p>
          <p className="text-[#6B7280]">
            Certaines informations peuvent être conservées au-delà pour
            satisfaire à des obligations légales (durées de conservation
            décrites dans la politique de confidentialité).
          </p>
        </div>
      </div>

      <p className="text-sm text-[#374151] leading-relaxed">
        Vous souhaitez garder une copie de vos données ?{" "}
        <a
          href="#export"
          className="text-[#5B4EC4] underline underline-offset-2 hover:text-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded-sm transition-colors duration-150"
        >
          Téléchargez-les avant de supprimer votre compte
        </a>
        .
      </p>

      <button
        type="button"
        onClick={onRequestDelete}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/50 transition-colors duration-150"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
        Supprimer définitivement mon compte
      </button>
    </section>
  );
}
