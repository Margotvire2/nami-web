import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Nami",
  description: "Politique de confidentialité et traitement des données personnelles sur Nami",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : 17 avril 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Responsable du traitement</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Le responsable du traitement des données collectées via la plateforme Nami est <strong>Margot Vire</strong>,
          diététicienne-nutritionniste (RPPS : 10007322976), 55 boulevard du Château, 92200 Neuilly-sur-Seine.
          Contact : <strong>contact@namipourlavie.com</strong>.
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
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Traitement automatisé des données (Art. 22 RGPD)</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Nami utilise des modèles d&apos;intelligence artificielle pour les finalités suivantes :
        </p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside mb-6">
          <li>
            <strong>Structurer les comptes-rendus de consultation</strong> : les dictées vocales sont transcrites
            et organisées en notes cliniques structurées.
          </li>
          <li>
            <strong>Générer des brouillons de synthèse clinique</strong> : les informations du dossier de soins
            sont résumées pour faciliter la coordination entre professionnels.
          </li>
          <li>
            <strong>Extraire les valeurs numériques de vos bilans</strong> : les résultats biologiques et de
            composition corporelle sont extraits automatiquement depuis vos documents.
          </li>
        </ul>

        <h3 className="text-sm font-semibold text-gray-800 mb-3">Sous-traitants impliqués dans le traitement IA</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-gray-600 border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">Sous-traitant</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">Service</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">Localisation</th>
                <th className="text-left py-2 font-semibold text-gray-700">Garanties</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium">Anthropic (Claude)</td>
                <td className="py-2 pr-4">Synthèse clinique, extraction de bilans, structuration documentaire</td>
                <td className="py-2 pr-4">États-Unis</td>
                <td className="py-2">DPA signé, Clauses Contractuelles Types (SCCs)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">OpenAI (Whisper)</td>
                <td className="py-2 pr-4">Transcription audio des consultations</td>
                <td className="py-2 pr-4">États-Unis</td>
                <td className="py-2">DPA signé, Clauses Contractuelles Types (SCCs)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 mb-2">Pseudonymisation préalable</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Avant tout envoi vers ces services, les données sont <strong>pseudonymisées</strong> au sens de
          l&apos;article 4(5) du RGPD : les noms, prénoms et dates de naissance sont remplacés par des
          identifiants génériques (ex : [PATIENT_0], [SOIGNANT_0]) avant transmission.
          Les fichiers audio sont supprimés de nos serveurs immédiatement après transcription.
          Anthropic et OpenAI <strong>ne ré-entraînent pas leurs modèles</strong> sur les données transmises
          via API, conformément à leurs contrats de traitement de données (DPA).
        </p>

        <h3 className="text-sm font-semibold text-gray-800 mb-2">Droit d&apos;opposition</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          Vous pouvez vous opposer à ces traitements automatisés à tout moment :
        </p>
        <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside mb-4">
          <li>Via les paramètres de votre compte (section &quot;Confidentialité&quot;)</li>
          <li>
            En contactant notre référent protection des données :{" "}
            <a href="mailto:dpo@namipourlavie.com" className="text-indigo-600 hover:underline font-medium">
              dpo@namipourlavie.com
            </a>
          </li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          En cas d&apos;opposition, les fonctionnalités de synthèse automatique et de transcription seront
          désactivées pour votre dossier. La coordination entre professionnels de santé restera possible
          sans traitement automatisé.
        </p>

        <h3 className="text-sm font-semibold text-gray-800 mb-2">Validation humaine obligatoire</h3>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-sm text-indigo-800 leading-relaxed">
            Les résultats générés par l&apos;intelligence artificielle sont systématiquement présentés comme des{" "}
            <strong>brouillons soumis à la validation du professionnel de santé</strong>. Aucune décision
            clinique n&apos;est prise automatiquement par Nami. Le professionnel de santé reste seul
            responsable de ses décisions thérapeutiques.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Vos droits</h2>
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
          Pour exercer ces droits : <strong>contact@namipourlavie.com</strong>.<br />
          Vous pouvez également saisir la CNIL : <strong>cnil.fr</strong>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Cookies et traceurs</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Nami utilise des cookies techniques strictement nécessaires au fonctionnement du service (authentification, session).
          Aucun cookie publicitaire ou de tracking tiers n&apos;est déposé sans consentement explicite.
        </p>
      </section>
    </article>
  );
}
