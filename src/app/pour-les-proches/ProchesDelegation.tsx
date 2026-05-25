import { UserPlus, Users, Repeat, Shield } from "lucide-react";

/**
 * Comment fonctionne le multi-profil délégué.
 *
 * Cohérent avec ProfileSwitcher (PR #62) et Delegation Person-centric (F1 G2 PR #17).
 *
 * RGPD strict :
 *   - Proche MAJEUR : consentement explicite obligatoire (notification + acceptation)
 *   - Mineur : autorité parentale (art. 371-1 Code civil) — gestion conjointe possible
 */
export function ProchesDelegation() {
  return (
    <section
      aria-labelledby="delegation-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="delegation-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Le multi-profil expliqué
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: "#6B7280", maxWidth: 540, margin: "0 auto" }}
          >
            Gérez votre profil et celui de vos proches depuis un seul compte,
            dans le respect de leur consentement.
          </p>
        </div>

        {/* 3 étapes */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-xl font-bold"
              style={{
                background: "#5B4EC4",
                color: "#fff",
                fontFamily: "var(--font-jakarta)",
              }}
              aria-hidden="true"
            >
              1
            </div>
            <UserPlus
              size={20}
              className="mx-auto mb-3"
              style={{ color: "#5B4EC4" }}
              aria-hidden="true"
            />
            <h3
              className="text-base md:text-lg font-bold mb-2"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Créez votre compte
            </h3>
            <p
              className="text-sm"
              style={{ color: "#6B7280", lineHeight: 1.55 }}
            >
              Inscrivez-vous comme patient avec votre propre profil personnel.
            </p>
          </div>

          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-xl font-bold"
              style={{
                background: "#5B4EC4",
                color: "#fff",
                fontFamily: "var(--font-jakarta)",
              }}
              aria-hidden="true"
            >
              2
            </div>
            <Users
              size={20}
              className="mx-auto mb-3"
              style={{ color: "#5B4EC4" }}
              aria-hidden="true"
            />
            <h3
              className="text-base md:text-lg font-bold mb-2"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Ajoutez un proche
            </h3>
            <p
              className="text-sm"
              style={{ color: "#6B7280", lineHeight: 1.55 }}
            >
              Pour un mineur : en tant que représentant légal. Pour un proche
              majeur : il reçoit une notification et accepte le partage.
            </p>
          </div>

          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-xl font-bold"
              style={{
                background: "#5B4EC4",
                color: "#fff",
                fontFamily: "var(--font-jakarta)",
              }}
              aria-hidden="true"
            >
              3
            </div>
            <Repeat
              size={20}
              className="mx-auto mb-3"
              style={{ color: "#5B4EC4" }}
              aria-hidden="true"
            />
            <h3
              className="text-base md:text-lg font-bold mb-2"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Basculez d&apos;un profil à l&apos;autre
            </h3>
            <p
              className="text-sm"
              style={{ color: "#6B7280", lineHeight: 1.55 }}
            >
              En un clic via le sélecteur de profil. Chaque profil garde son
              espace, ses rendez-vous, ses documents.
            </p>
          </div>
        </div>

        {/* Note RGPD + Code civil */}
        <div
          className="p-5 md:p-6 rounded-2xl"
          style={{
            background: "rgba(91,78,196,0.04)",
            border: "1px solid rgba(91,78,196,0.15)",
          }}
        >
          <div className="flex items-start gap-3">
            <Shield
              size={20}
              style={{ color: "#5B4EC4", flexShrink: 0, marginTop: 2 }}
              aria-hidden="true"
            />
            <div>
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "#1A1A2E" }}
              >
                Cadre légal du partage
              </p>
              <ul
                className="flex flex-col gap-2 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <li>
                  <strong>Proche majeur</strong> : consentement explicite
                  obligatoire (RGPD). Votre proche reçoit une notification et
                  doit accepter. Il peut retirer cet accès à tout moment.
                </li>
                <li>
                  <strong>Mineur</strong> : gestion par le ou les représentants
                  légaux dans le cadre de l&apos;autorité parentale (article
                  371-1 du Code civil). Gestion conjointe possible entre les
                  deux parents.
                </li>
                <li>
                  <strong>Tutelle, curatelle, habilitation familiale</strong>{" "}
                  : si votre proche n&apos;est pas en état de consentir,
                  contactez-nous pour vous accompagner dans la mise en place.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
