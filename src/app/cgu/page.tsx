import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Nami",
  description:
    "Conditions générales d'utilisation du service Nami, plateforme de coordination des soins.",
  robots: { index: true, follow: true },
};

export default function CguPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-[#1A1A2E]">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="text-sm text-[#6B7280] mb-8">
        Dernière mise à jour : 25 mai 2026
      </p>

      <div
        role="note"
        className="bg-[rgba(91,78,196,0.06)] border border-[rgba(91,78,196,0.16)] rounded-xl p-4 mb-8 text-sm"
      >
        ⚠️ Cette page est en cours de validation avec notre conseil juridique.
        Pour toute question, contactez{" "}
        <a
          href="mailto:contact@namipourlavie.com"
          className="underline text-[#5B4EC4]"
        >
          contact@namipourlavie.com
        </a>
        .
      </div>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Objet</h2>
          <p className="text-sm leading-relaxed">
            Les présentes conditions générales d&apos;utilisation (ci-après « CGU »)
            ont pour objet de définir les modalités d&apos;accès et d&apos;utilisation
            du service Nami (ci-après « le Service »), édité par la société Nami
            (SASU), dont les coordonnées figurent sur la page{" "}
            <a href="/mentions-legales" className="underline">Mentions légales</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Acceptation</h2>
          <p className="text-sm leading-relaxed">
            L&apos;utilisation du Service implique l&apos;acceptation pleine et entière
            des présentes CGU. Si vous n&apos;acceptez pas tout ou partie de ces
            conditions, vous devez renoncer à utiliser le Service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Inscription et accès au Service</h2>
          <p className="text-sm leading-relaxed">
            L&apos;accès au Service requiert la création d&apos;un compte. Les
            informations fournies lors de l&apos;inscription doivent être exactes
            et à jour. L&apos;utilisateur est responsable de la confidentialité de
            ses identifiants.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Description du Service</h2>
          <p className="text-sm leading-relaxed">
            Nami est un <strong>outil de coordination des soins de santé</strong>
            destiné à faciliter l&apos;organisation et la communication entre les
            membres d&apos;une équipe soignante et le patient. Nami n&apos;est
            <strong> pas un dispositif médical</strong> au sens du Règlement (UE)
            2017/745 et ne fournit pas d&apos;aide à la décision médicale.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            En cas d&apos;urgence médicale, l&apos;utilisateur doit contacter le
            <strong> 15</strong> (SAMU) ou le <strong>112</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Engagements de l&apos;utilisateur</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Utiliser le Service conformément à sa destination</li>
            <li>Fournir des informations exactes lors de l&apos;inscription</li>
            <li>Préserver la confidentialité de ses identifiants</li>
            <li>Respecter les droits des autres utilisateurs et le secret professionnel applicable</li>
            <li>Ne pas tenter de contourner les mesures de sécurité du Service</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Engagements de Nami</h2>
          <p className="text-sm leading-relaxed">
            Nami s&apos;engage à fournir le Service avec diligence et selon les
            règles de l&apos;art, étant précisé qu&apos;il s&apos;agit d&apos;une
            obligation de moyens. Nami ne fournit aucun avis médical et ne se
            substitue pas au jugement clinique des professionnels de santé.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            Nami s&apos;efforce d&apos;assurer la disponibilité du Service mais ne
            peut garantir une disponibilité ininterrompue.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Propriété intellectuelle</h2>
          <p className="text-sm leading-relaxed">
            Tous les éléments du Service (marques, logos, textes, interfaces, code,
            base documentaire) sont la propriété exclusive de Nami ou de ses
            partenaires. Toute reproduction non autorisée est interdite.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Données personnelles</h2>
          <p className="text-sm leading-relaxed">
            Le traitement des données personnelles dans le cadre du Service est
            décrit dans notre{" "}
            <a href="/confidentialite" className="underline">
              Politique de confidentialité
            </a>
            , conforme au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique
            et Libertés modifiée.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Responsabilité</h2>
          <p className="text-sm leading-relaxed">
            La responsabilité de Nami ne saurait être engagée pour des dommages
            résultant d&apos;une utilisation non conforme du Service, d&apos;un cas
            de force majeure ou du fait d&apos;un tiers. Nami ne se substitue pas
            aux décisions des professionnels de santé.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Modification des CGU</h2>
          <p className="text-sm leading-relaxed">
            Nami se réserve le droit de modifier les présentes CGU à tout moment.
            Les utilisateurs seront informés des modifications substantielles via
            le Service ou par e-mail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">11. Loi applicable et juridiction</h2>
          <p className="text-sm leading-relaxed">
            Les présentes CGU sont soumises au droit français. Tout litige relatif
            à leur interprétation ou à leur exécution relève de la compétence
            exclusive des tribunaux français compétents.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p className="text-sm leading-relaxed">
            Pour toute question relative aux présentes CGU :{" "}
            <a href="mailto:contact@namipourlavie.com" className="underline">
              contact@namipourlavie.com
            </a>
          </p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-[#E5E7EB] text-xs text-[#6B7280] text-center">
        Outil de coordination · Nami n&apos;est pas un dispositif médical · Conforme RGPD
      </footer>
    </main>
  );
}
