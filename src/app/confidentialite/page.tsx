import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Nami",
  description:
    "Politique de confidentialité et protection des données personnelles du service Nami (RGPD).",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-[#1A1A2E]">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
        Politique de confidentialité
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
          <h2 className="text-xl font-semibold mb-3">1. Responsable de traitement</h2>
          <p className="text-sm leading-relaxed">
            <strong>Nami</strong> — SASU, dont les coordonnées complètes figurent
            sur la page <a href="/mentions-legales" className="underline">Mentions
            légales</a>, est responsable du traitement des données personnelles
            collectées via le service Nami au sens du Règlement (UE) 2016/679 (RGPD)
            et de la loi Informatique et Libertés modifiée.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
          <p className="text-sm leading-relaxed">
            Selon votre statut (patient, soignant), Nami collecte les catégories de
            données suivantes :
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1">
            <li>Données d&apos;identification : nom, prénom, e-mail, téléphone</li>
            <li>Données professionnelles (soignants) : RPPS, spécialités, lieu d&apos;exercice</li>
            <li>Données de santé (patients) : éléments du dossier de coordination saisis par les soignants ou le patient</li>
            <li>Données techniques : adresse IP, journaux de connexion (durée limitée)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Finalités du traitement</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li>Fourniture du service de coordination des soins</li>
            <li>Authentification et sécurité des accès</li>
            <li>Communication entre les membres de l&apos;équipe soignante</li>
            <li>Amélioration du service (statistiques agrégées et anonymisées)</li>
            <li>Respect des obligations légales et réglementaires</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Bases légales</h2>
          <ul className="list-disc list-inside text-sm leading-relaxed space-y-1">
            <li><strong>Exécution du contrat</strong> (Art. 6.1.b RGPD) : fourniture du service</li>
            <li><strong>Consentement</strong> (Art. 6.1.a et 9.2.a RGPD) : traitement des données de santé</li>
            <li><strong>Obligation légale</strong> (Art. 6.1.c RGPD) : conservation des données pour les obligations comptables et de santé publique</li>
            <li><strong>Intérêt légitime</strong> (Art. 6.1.f RGPD) : amélioration du service et lutte contre la fraude</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Destinataires des données</h2>
          <p className="text-sm leading-relaxed">
            Les données personnelles sont destinées :
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1">
            <li>Aux membres autorisés de l&apos;équipe soignante du patient</li>
            <li>À l&apos;équipe Nami pour la gestion technique et le support</li>
            <li>Aux hébergeurs (Vercel pour l&apos;application web, Supabase pour les données en région eu-west-3 Paris)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-2">
            Aucune donnée n&apos;est cédée ou vendue à des tiers à des fins
            commerciales.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Durée de conservation</h2>
          <p className="text-sm leading-relaxed">
            Conformément à l&apos;article R. 1112-7 du Code de la santé publique,
            les données relatives au dossier de coordination sont conservées
            <strong> 20 ans</strong> à compter de la dernière prise en charge.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            Les autres données (compte utilisateur, journaux techniques) sont
            conservées pour des durées proportionnées à leurs finalités.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Vos droits</h2>
          <p className="text-sm leading-relaxed">
            Conformément aux articles 12 à 22 du RGPD, vous disposez des droits
            suivants :
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed mt-2 space-y-1">
            <li>Droit d&apos;<strong>accès</strong> à vos données (Art. 15)</li>
            <li>Droit de <strong>rectification</strong> (Art. 16)</li>
            <li>Droit à l&apos;<strong>effacement</strong> (Art. 17)</li>
            <li>Droit à la <strong>limitation</strong> du traitement (Art. 18)</li>
            <li>Droit à la <strong>portabilité</strong> (Art. 20)</li>
            <li>Droit d&apos;<strong>opposition</strong> (Art. 21)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Exercice des droits</h2>
          <p className="text-sm leading-relaxed">
            Pour exercer vos droits, contactez-nous à :{" "}
            <a href="mailto:contact@namipourlavie.com" className="underline">
              contact@namipourlavie.com
            </a>
            . Nous répondons dans un délai d&apos;un mois (Art. 12.3 RGPD).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Délégué à la protection des données (DPO)</h2>
          <p className="text-sm leading-relaxed">
            Coordonnées du DPO : à compléter (la désignation d&apos;un DPO est en cours).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Droit de réclamation auprès de la CNIL</h2>
          <p className="text-sm leading-relaxed">
            Si vous estimez que le traitement de vos données ne respecte pas la
            réglementation, vous pouvez introduire une réclamation auprès de la
            Commission Nationale de l&apos;Informatique et des Libertés (CNIL) :{" "}
            <a
              href="https://www.cnil.fr"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.cnil.fr
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">11. Cookies</h2>
          <p className="text-sm leading-relaxed">
            Nami n&apos;utilise pas de cookie de traçage publicitaire ni de mesure
            d&apos;audience non essentielle. Seuls les cookies strictement
            nécessaires au fonctionnement du service (authentification, préférences
            d&apos;affichage) sont utilisés.
          </p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-[#E5E7EB] text-xs text-[#6B7280] text-center">
        Outil de coordination · Nami n&apos;est pas un dispositif médical · Conforme RGPD
      </footer>
    </main>
  );
}
