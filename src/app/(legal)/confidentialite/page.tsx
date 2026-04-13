import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Nami",
  description: "Politique de confidentialité et traitement des données personnelles sur Nami",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : avril 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Responsable du traitement</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Le responsable du traitement des données collectées via la plateforme Nami est la société éditrice,
          joignable à l&apos;adresse <strong>contact@nami-sante.fr</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Données collectées</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">Nami collecte les données suivantes :</p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li><strong>Données d&apos;identification professionnelle</strong> : nom, prénom, email, spécialité, numéro RPPS</li>
          <li><strong>Données de connexion</strong> : adresse IP, navigateur, horodatage des connexions</li>
          <li><strong>Données de dossiers patients</strong> : saisies par les professionnels dans le cadre de leur activité clinique</li>
          <li><strong>Enregistrements de consultation</strong> : uniquement avec le consentement explicite du patient</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Données de santé</h2>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-3">
          <p className="text-sm text-blue-800">
            Les données de santé à caractère personnel sont hébergées sur une infrastructure certifiée
            <strong> Hébergeur de Données de Santé (HDS)</strong> conformément à l&apos;article L.1111-8 du CSP.
          </p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Le professionnel de santé qui intègre des données patients dans Nami agit en qualité de responsable
          du traitement vis-à-vis de ses patients. Nami intervient en qualité de sous-traitant
          au sens de l&apos;article 28 du RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Finalités du traitement</h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Fourniture et amélioration du service de coordination de parcours de soins</li>
          <li>Gestion des comptes utilisateurs et authentification</li>
          <li>Génération de synthèses cliniques assistées (brouillons soumis à validation)</li>
          <li>Sécurité et prévention de la fraude</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Durée de conservation</h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Données de compte professionnel : durée de l&apos;abonnement + 3 ans</li>
          <li>Dossiers patients : durée légale applicable aux dossiers médicaux (20 ans pour les adultes)</li>
          <li>Logs de connexion : 12 mois</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Vos droits</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Droit d&apos;accès et de rectification</li>
          <li>Droit à l&apos;effacement (sous réserve des obligations légales de conservation)</li>
          <li>Droit à la portabilité</li>
          <li>Droit d&apos;opposition</li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Pour exercer ces droits : <strong>contact@nami-sante.fr</strong>.<br />
          Vous pouvez également saisir la CNIL : <strong>cnil.fr</strong>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Cookies et traceurs</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Nami utilise des cookies techniques strictement nécessaires au fonctionnement du service (authentification, session).
          Aucun cookie publicitaire ou de tracking tiers n&apos;est déposé sans consentement explicite.
        </p>
      </section>
    </article>
  );
}
