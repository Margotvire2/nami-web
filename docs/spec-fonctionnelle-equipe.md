# Spécification fonctionnelle — Équipe
> Document de référence pour la refonte UX/UI. Explique le POURQUOI de chaque élément, la logique métier, les sources de données et les routes API. Ne pas redesigner sans avoir lu ce document.

---

## Vue d'ensemble

La page Équipe est le **hub de formation du réseau professionnel** d'un soignant sur Nami. Elle répond à une question simple : "Comment faire entrer un confrère dans mon écosystème de travail ?"

Elle a quatre onglets qui couvrent quatre étapes logiques :
1. **Confrères** — les soignants avec qui je travaille déjà (patients en commun)
2. **Structures** — les organisations auxquelles j'appartiens
3. **Annuaire RPPS** — chercher n'importe quel soignant en France
4. **Invitations** — suivre les invitations que j'ai envoyées

**Différence avec la Vue réseau (/reseau) :** la Vue réseau concerne les organisations (CPTS, réseaux, hôpitaux). L'Équipe concerne les individus — les soignants avec qui je collabore ou que je veux inviter à rejoindre Nami.

**Tier requis :** la création d'invitations nécessite le tier COORDINATION minimum (79€/mois). Le tier gratuit PRESENCE peut voir la page mais ne peut pas envoyer d'invitation.

---

## 1. Onglet Confrères

### 1.1 Rôle

Afficher les soignants qui partagent au moins un patient avec moi sur Nami. Ce sont mes collaborateurs effectifs — pas des contacts génériques, des soignants avec qui je travaille concrètement.

### 1.2 Ce qui définit un "confrère"

Un confrère apparaît dans cet onglet si et seulement si :
- Il est membre accepté (`CareCaseMember.status: ACCEPTED`) d'au moins un CareCase
- Et ce même CareCase compte également le soignant connecté comme membre

**Ce n'est pas :** un contact manuel, un réseau social, un annuaire d'amis. C'est une relation de facto — elle se crée automatiquement quand deux soignants travaillent sur le même patient.

**Pourquoi ce choix :** dans la médecine pluridisciplinaire, un "confrère" qui compte n'est pas quelqu'un qu'on a suivi sur une plateforme — c'est quelqu'un avec qui on a pris en charge un patient. Ce critère garantit que les confrères affichés sont pertinents.

### 1.3 Données affichées par carte

- Avatar avec initiales (pas de photo)
- Nom complet + badge vert "Sur Nami"
- Spécialité principale (`ProviderProfile.specialties[0]`)
- Compteur : "N patients en commun"
- Bouton dossier → `/patients` (filtrée sur les patients partagés)
- Bouton message → `/collaboration` (ouvre un DM avec ce confrère)

### 1.4 État vide

"Vos confrères apparaîtront ici — Dès que vous partagez un dossier patient avec un autre soignant, il apparaîtra dans votre réseau."

**Pourquoi cet état vide est pédagogique :** un nouveau soignant qui arrive sur Nami et voit un onglet vide pourrait penser que c'est cassé. Le message lui explique le mécanisme de formation du réseau et l'incite à inviter des confrères.

---

## 2. Onglet Structures

### 2.1 Rôle

Afficher les structures professionnelles créées par le soignant (cabinets, associations, groupes). Différent de l'onglet "Mes réseaux" dans /reseau qui concerne les organisations CPTS/réseaux/hôpitaux — ici ce sont les structures propres du soignant.

### 2.2 Données affichées

- Icône bâtiment
- Nom + type + ville + code postal
- Adresse complète si renseignée
- Bouton "Gérer" (désactivé, marqué "Prochainement")
- Bouton "Rejoindre une structure" (désactivé, marqué "Prochainement")

### 2.3 État actuel

Cette fonctionnalité est en cours de développement (V2). Les structures sont affichées mais la gestion complète (modifier, ajouter des membres à une structure) n'est pas encore disponible.

---

## 3. Onglet Annuaire RPPS

### 3.1 Rôle

Rechercher dans la base nationale des 564 000+ professionnels de santé français pour trouver un confrère à inviter sur Nami ou à adresser un patient.

### 3.2 Source des données

**Table `HealthDirectory`** dans la base PostgreSQL de Nami — importée depuis le dataset Ameli sur data.gouv.fr (RPPS national).

Ce n'est **pas** un appel à une API externe à chaque recherche — la base est pré-importée localement pour des recherches rapides.

**Données disponibles par professionnel :**
- Nom, prénom
- Spécialité (libellé + code)
- Ville + code postal + adresse
- Secteur de conventionnement (1, 2 ou non-conventionné)
- Numéro de téléphone (si disponible)
- Numéro RPPS
- Type : PS (Professionnel de Santé) ou CDS (Centre De Santé)

### 3.3 Mécanisme de recherche

Champ de recherche libre → `GET /annuaire/directory?q=...`

Le backend effectue une recherche en texte intégral sur : nom, prénom, spécialité, ville, raison sociale. Logique AND/OR par terme. Résultats limités à 20 par défaut (max 50), triés par ville puis nom.

### 3.4 Affichage des résultats

```
┌─────────────────────────────────────────────────┐
│ (avatar)  Dr. Jean Dupont                       │
│           Psychiatrie · Paris · 75014           │
│           Secteur 1  ·  01 23 45 67 89          │
│                                    [Inviter]    │
└─────────────────────────────────────────────────┘
```

**Codage couleur du secteur de conventionnement :**
- Secteur 1 → badge vert (tarifs opposables)
- Secteur 2 → badge amber (dépassements d'honoraires)
- Non-conventionné → badge gris

**Pourquoi afficher le secteur :** pour un soignant qui adresse un patient avec des contraintes financières (ALD, CMU), le secteur est une information de coordination directement utile.

### 3.5 Bouton "Inviter"

Actuellement désactivé ("bientôt disponible"). Quand il sera actif : ouvrira la modale d'invitation pré-remplie avec l'email du professionnel (si disponible dans le RPPS) ou générera un lien à partager.

---

## 4. Onglet Invitations

### 4.1 Rôle

Suivre l'état de toutes les invitations envoyées. Un soignant invite un confrère → l'invitation apparaît ici avec son statut. Il peut renvoyer les invitations expirées.

### 4.2 Les 3 états d'une invitation

| Statut | Badge | Icône | Déclencheur |
|--------|-------|-------|-------------|
| `PENDING` | Amber "En attente" | Enveloppe | Invitation créée, pas encore acceptée, non expirée |
| `ACCEPTED` | Vert "Acceptée" | Check | Le destinataire a cliqué le lien et accepté |
| Expirée | Gris "Expirée" | Horloge | `status === PENDING` ET `expiresAt < maintenant` (7 jours) |

**Pourquoi "expiré" n'est pas un statut en base :** l'expiration est calculée à la volée (`expiresAt < now()`) plutôt que stockée comme statut. Ça évite un job de maintenance pour marquer les invitations expirées et garantit une précision à la seconde.

### 4.3 Données affichées par invitation

- Email du destinataire OU "Invitation par lien" si aucun email (invitation lien)
- Badge de statut
- Date d'envoi (relative : "aujourd'hui", "hier", "il y a 3j", ou date complète)
- Dossier lié si applicable : "Dossier : [nom du CareCase]"
- Nom de la personne qui a accepté (si ACCEPTED)
- Bouton "Renvoyer" (uniquement pour les invitations expirées)

### 4.4 Renvoi d'invitation (resend)

Bouton "Renvoyer" → `POST /invitations/:id/resend`

Ce que ça fait :
- Remet le statut à `PENDING`
- Prolonge `expiresAt` de +7 jours
- Renvoie l'email avec le même token (ou un nouveau)

**Pourquoi seulement sur les expirées :** renvoyer une invitation encore valide créerait de la confusion (le destinataire reçoit deux emails identiques). La restriction "expirées uniquement" est une règle de bon sens.

---

## 5. La modale d'invitation (InviteModal)

### 5.1 Déclenchement

Bouton "Inviter un confrère" dans le header de la page (accessible depuis tous les onglets).

### 5.2 Deux méthodes

**Méthode 1 — Par email :**
1. Champ email du destinataire
2. Message personnalisé (pré-rempli avec un texte par défaut en français)
3. Bouton "Envoyer l'invitation"

Ce qui se passe :
- `POST /invitations` avec `{ email, message }`
- Création d'un enregistrement `Invitation` (status: PENDING, token UUID, expire dans 7 jours)
- Email envoyé via Resend avec le lien d'invitation
- Toast "Invitation envoyée !"
- L'invitation apparaît immédiatement dans l'onglet Invitations

**Méthode 2 — Par lien :**
1. Bouton "Générer le lien"
2. URL copiable affichée dans une boîte
3. Bouton "Copier" (avec confirmation toast)
4. Rappel : "Ce lien expire dans 7 jours"

Ce qui se passe :
- `POST /invitations` sans email (`toEmail: null`)
- Invitation créée avec lien unique
- **Aucun email envoyé** — le soignant distribue le lien lui-même (SMS, WhatsApp, verbal)

**Pourquoi deux méthodes :** tous les soignants n'ont pas l'email de leur confrère. Le lien permet d'inviter via les canaux existants (WhatsApp de groupe de la CPTS, SMS direct) sans avoir besoin de l'email professionnel.

---

## 6. Ce qui se passe quand une invitation est acceptée

Quand le destinataire clique le lien et accepte (`POST /invitations/:token/accept`) :

### 6.1 Toujours (quelle que soit l'invitation)

1. `Invitation.status` → ACCEPTED
2. `Invitation.acceptedAt` → maintenant
3. `Invitation.acceptedById` → ID du soignant qui a accepté

### 6.2 Si l'invitation est liée à un CareCase (`careCaseId` présent)

4. **Validation automatique du profil** : `ProviderProfile.validatedStatus = true`
   - Logique de confiance par pair ("trusted peer invite") : si un soignant déjà validé t'invite, tu es automatiquement pré-validé
5. **Vérification automatique de l'email** : `Person.emailVerifiedAt = now()`
   - L'acte d'accepter via le lien prouve que l'email reçu est valide
6. **Création d'un `CareCaseMember`** :
   - `roleInCase: "Invité"`
   - `status: ACCEPTED`
   - `joinedAt: maintenant`
   - `invitedBy: ID du soignant expéditeur`

**Ce que ça signifie concrètement :** un soignant invité depuis un dossier patient est immédiatement dans la care team de ce patient. Il peut lire les notes, voir les observations, envoyer des messages dans le dossier. Sans aucune étape supplémentaire.

### 6.3 Pourquoi la validation automatique du profil

Nami a un processus de validation des soignants (vérification RPPS). Mais si un soignant déjà validé invite un confrère, la confiance est transférée. C'est un mécanisme de "web of trust" qui accélère l'onboarding tout en maintenant la qualité du réseau.

---

## 7. Lien avec la fiche patient

### 7.1 Onglet Équipe dans la fiche patient

La fiche patient a un onglet Coordination → sous-onglet Équipe qui affiche les `CareCaseMembers` de ce patient spécifique.

Ce n'est **pas** la même chose que la page `/equipe` :
- `/equipe` = tous mes confrères sur Nami, mon annuaire, mes invitations
- Fiche patient → Équipe = les membres de l'équipe de CE patient uniquement

### 7.2 Le bouton "Inviter" dans la fiche patient

Le bouton "Inviter" dans l'onglet Équipe de la fiche patient navigue vers `/equipe` (page globale). Il ne crée pas une invitation directement depuis la fiche patient.

**Pourquoi :** l'invitation est un flux d'onboarding (le soignant rejoint Nami). La fiche patient, elle, permet d'adresser via le flux Referral (le soignant est déjà sur Nami). Ce sont deux flux distincts pour deux situations différentes.

### 7.3 Distinction invitation vs adressage

| | Invitation (`/invitations`) | Adressage (`/referrals`) |
|--|---------------------------|--------------------------|
| **Destinataire** | Soignant pas encore sur Nami | Soignant déjà sur Nami |
| **Objectif** | Faire rejoindre la plateforme | Déléguer la prise en charge d'un patient |
| **Données patient** | Non transmises dans l'email | Visibles sur la plateforme |
| **Résultat** | Compte créé + éventuellement ajout à une care team | Acceptation + ajout à la care team |
| **Flux** | Email/lien → page d'inscription | Notification in-app + email |

---

## 8. Routes API complètes

```
GET   /providers/my-colleagues
      → Soignants partageant au moins un CareCase avec l'utilisateur connecté
      → Calculé via jointure CareCaseMember × CareCaseMember
      → Retourne : { id, firstName, lastName, specialties[], sharedPatientsCount }

GET   /providers/me/structures
      → Structures créées par le soignant connecté (ProviderStructure)

GET   /annuaire/directory?q=...&limit=20
      → Recherche full-text dans HealthDirectory (564K entrées Ameli)
      → Filtres : q (texte libre), postalCode, city, specialty, convention, type
      → Triés par ville ASC, lastName ASC
      → Retourne : HealthDirectory[]

GET   /invitations/mine
      → Invitations envoyées par l'utilisateur connecté
      → Inclut : toEmail, status, expiresAt, careCaseId, acceptedBy, createdAt

POST  /invitations
      → Créer une invitation (tier COORDINATION requis)
      → Body : { email?: string, message?: string, careCaseId?: string }
      → Si email : envoie l'email via Resend
      → Si pas d'email : génère le lien sans envoyer d'email
      → Retourne : { id, token, inviteUrl, expiresAt }

POST  /invitations/:id/resend
      → Renvoyer une invitation expirée
      → Remet status PENDING + prolonge expiresAt +7j
      → Renvoie l'email si toEmail est présent

POST  /invitations/:token/accept
      → Accepter une invitation (page publique /invite/:token)
      → Met à jour Invitation (ACCEPTED + acceptedAt + acceptedById)
      → Si careCaseId : crée CareCaseMember + valide profil + vérifie email
      → Retourne : { invitation, careCase? }
```

---

## 9. Points critiques à ne jamais perdre dans la refonte

1. **Les confrères sont définis par les patients en commun** — pas un système de "suivre" ou d'"ajouter". C'est une relation de fait, automatique. L'UI ne doit jamais avoir un bouton "Ajouter à mes confrères" — la relation se crée par le travail.

2. **Les 3 états d'invitation sont distincts** — PENDING (actif), ACCEPTED, et Expiré (PENDING mais `expiresAt < now()`). Ces trois états ont des couleurs et des actions différentes. Ne pas les fusionner.

3. **"Renvoyer" uniquement sur les invitations expirées** — jamais sur une invitation en attente. Afficher le bouton sur une invitation active créerait des doublons d'email.

4. **Le bouton "Inviter" dans l'annuaire RPPS est désactivé** — ne pas le supprimer. Il signale la direction produit (cette fonctionnalité arrive) et guide les attentes de l'utilisateur.

5. **Validation automatique du profil à l'acceptation** — si le designer imagine un flux "invitation → inscription → attente de validation admin", c'est faux. Quand une invitation est acceptée depuis un dossier patient, le soignant est immédiatement dans la care team. Aucune étape de validation manuelle.

6. **Distinction `/equipe` (individus) vs `/reseau` (organisations)** — ces deux pages ne doivent pas être fusionnées. Une CPTS est une organisation avec des règles de gouvernance. Un confrère est un individu avec qui on travaille. Les deux ont des flux d'entrée différents.

7. **Invitation par lien = aucun email envoyé** — si le designer imagine que "Par lien" est juste une autre façon d'envoyer un email, c'est faux. Le lien est généré et distribué par le soignant lui-même (WhatsApp, SMS). Nami n'envoie rien.

8. **Le tier COORDINATION bloque la création d'invitations** — le bouton "Inviter un confrère" sur un compte PRESENCE doit afficher un prompt d'upgrade, pas lancer la modale. L'UI doit distinguer ces deux cas.

9. **La source RPPS est locale (564K entrées en DB)** — ce n'est pas une recherche en temps réel sur une API externe. Le résultat doit être rapide (<200ms). Si la recherche est lente, c'est un problème d'index, pas de latence réseau.

10. **L'onglet Structures est en V2** — les boutons "Gérer" et "Rejoindre une structure" sont désactivés intentionnellement. Ne pas les retirer du design — ils font partie de la roadmap visible pour l'utilisateur.

---

## 10. Opportunités d'amélioration UX

- **Suggestions d'invitation contextuelles** : sur la fiche patient, si un spécialiste manque dans l'équipe (ex: pas de psychiatre pour un dossier TCA), suggérer de chercher dans l'annuaire RPPS avec la spécialité pré-filtrée.

- **Statut "Vu" sur les invitations** : actuellement on sait si une invitation a été acceptée ou non, mais pas si elle a été ouverte. Un statut intermédiaire "Lien ouvert" permettrait de distinguer "ignoré" de "pas encore vu".

- **Historique des collaborations** : un soignant qui a travaillé avec un confrère sur 5 patients il y a 6 mois — ce confrère n'apparaît plus dans les Confrères si aucun dossier actif commun. Un historique "anciens confrères" pourrait être utile pour retrouver quelqu'un.

- **Import de contacts** : permettre d'importer une liste d'emails (CSV, Google Contacts) pour envoyer des invitations en masse — utile pour une CPTS qui veut onboarder 30 soignants d'un coup.
