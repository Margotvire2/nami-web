# Spec fonctionnelle — /reglages (Profil & Paramètres)

> Document de référence pour la refonte UX/UI.  
> Objectif : que le designer comprenne POURQUOI chaque élément existe, comment il fonctionne, et ce qu'il ne faut surtout pas perdre.

---

## Rôle de la page

`/reglages` est le centre de contrôle de l'identité professionnelle du soignant sur Nami.  
Elle sert trois finalités distinctes :

1. **Identité & profil public** : ce que les autres soignants et les patients voient sur `/soignants/[slug]`
2. **Configuration de l'outil** : comment Nami se comporte pour ce soignant (visibilité, notifications)
3. **Sécurité & RGPD** : MFA, export de données, gestion du compte

La page n'est pas segmentée en onglets mais en **accordéons collapsibles** — chaque section peut être ouverte indépendamment. Une **barre de sauvegarde sticky** apparaît en bas dès qu'un champ est modifié (`hasChanges === true`) et disparaît après sauvegarde.

---

## Architecture de la page

### Barre de sauvegarde sticky
- Apparaît dès qu'un champ est modifié
- Bouton "Annuler" : réinitialise tous les champs à leur valeur serveur
- Bouton "Enregistrer" : PATCH `/providers/me` avec les champs modifiés
- Disparaît après succès ou annulation
- Critiquement : ne pas perdre ce pattern dans la refonte — évite les sauvegardes partielles accidentelles

---

## Section 1 — Identité professionnelle

### Pourquoi elle existe
C'est la carte d'identité professionnelle. Elle alimente le profil public, les en-têtes de lettres d'adressage générées par l'IA, et la recherche dans l'annuaire des 564 000+ professionnels.

### Champs et comportement

| Champ | Éditable | Source | Notes |
|-------|----------|--------|-------|
| Prénom / Nom | ✅ | ProviderProfile | Affiché dans tous les contextes |
| Photo de profil | ✅ | Upload → Supabase Storage | Avatar affiché dans l'équipe, les adressages, les RCP |
| Titre / Civilité | ✅ | ProviderProfile | Dr, M., Mme, etc. |
| Spécialité principale | ✅ | ProviderProfile.specialty | Alimente l'annuaire et le matching d'adressage |
| RPPS | ❌ Read-only | Défini à l'inscription | Identifiant national — ne peut pas être modifié en UI |
| ADELI | ❌ Read-only | Défini à l'inscription | Idem — aucune route de mise à jour |
| Numéro Ordre | ✅ | ProviderProfile | Affiché sur les lettres d'adressage |
| Biographie courte | ✅ | ProviderProfile.bio | Visible sur le profil public |
| Langues parlées | ✅ | ProviderProfile.languages | Affiché dans l'annuaire |

**Point critique** : RPPS et ADELI sont READ-ONLY dans l'UI. Ne pas créer de champs éditables pour ces deux identifiants — toute modification passerait par le support Nami.

---

## Section 2 — Mode d'exercice

### Pourquoi elle existe
Détermine comment le soignant est référencé dans l'annuaire et ses capacités de facturation dans Nami.

### Champs

| Champ | Type | Notes |
|-------|------|-------|
| Type d'exercice | Enum | LIBERAL / SALARIED / MIXED |
| Conventionnement | Enum | SECTOR_1 / SECTOR_2 / NON_CONVENTIONED / NOT_APPLICABLE |
| Profession détaillée | Texte | Complément de spécialité (ex: "Diététicienne spécialisée TCA") |
| Années d'expérience | Numérique | Affiché sur le profil public |

**Impact sur la facturation** : le type d'exercice détermine les actes disponibles dans le module facturation. SALARIED = certains actes non disponibles. Ne pas décorréler ce champ de la logique facturation.

---

## Section 3 — Consultation

### Pourquoi elle existe
Configure les paramètres par défaut de l'agenda — mais attention : les paramètres fins de l'agenda (horaires, types de créneaux, durées par défaut) sont sur une **page séparée** : `/agenda/parametrage`. Cette section ne contient que les préférences générales.

### Champs

| Champ | Type | Notes |
|-------|------|-------|
| Durée de consultation par défaut | Minutes | Utilisé par le Smart Slot Algorithm |
| Buffer entre consultations | Minutes | `agendaBuffer` — temps libre automatique après chaque RDV |
| Mode compact agenda | Booléen | `agendaSmartCompact` — compresse les créneaux vides |
| Tarif de consultation | Montant €  | Pré-rempli dans le module facturation |
| Téléconsultation activée | Booléen | Affiche l'option visio dans le booking public |
| Adresse de consultation | Texte | Géocodée pour l'annuaire |

**Lien avec `/agenda/parametrage`** : renvoyer explicitement vers cette page avec un lien — ne pas dupliquer les paramètres fins ici.

---

## Section 4 — Structures d'exercice

### Pourquoi elle existe
Un soignant peut exercer dans plusieurs structures (cabinet, hôpital, MSP, etc.). Ces structures apparaissent dans son profil public et dans les lettres d'adressage générées par l'IA.

### Comportement
- Liste des structures où le soignant est membre (via `OrganizationMember`)
- Bouton "Rejoindre une structure" → recherche dans le Hub Réseau
- Possibilité de définir une structure "principale" (apparaît en premier dans le profil)
- Pas de création de structure depuis cette page — ça se fait dans `/reseau`

---

## Section 5 — Réseau & Visibilité

### Pourquoi elle existe
Contrôle la visibilité du profil public sur `/soignants/[slug]` — page SEO indexée. C'est un choix professionnel sensible : certains soignants ne veulent pas être référencés publiquement.

### Champ principal : `profileVisibility`

```
Enum: ALL | VERIFIED_ONLY | PRIVATE
```

| Valeur | Comportement |
|--------|-------------|
| `ALL` | Profil visible par tous sur `/soignants/[slug]`, indexé Google |
| `VERIFIED_ONLY` | Profil visible uniquement par les soignants Nami vérifiés (connectés) |
| `PRIVATE` | Profil non visible publiquement — soignant introuvable dans l'annuaire |

**Point critique** : ce champ a un impact direct sur le SEO et la page `/soignants/[slug]`. La logique de rendu de cette page lit `profileVisibility` côté serveur. Ne pas supprimer ce contrôle dans la refonte — c'est une exigence légale (droit à l'effacement + RGPD).

### Autres champs visibilité
- Afficher le téléphone sur le profil public : booléen
- Afficher l'email professionnel : booléen
- Accepter les demandes de mise en relation réseau : booléen

---

## Section 6 — Formations & Certifications

### Pourquoi elle existe
Crédibilise le soignant dans l'annuaire et auprès des équipes qui lisent son profil avant un adressage.

### Champs
- Liste de formations (DU, DIU, masters, certifications) — champs libres
- Bouton "Ajouter une formation" → inline form (pas de modale)
- Suppressible individuellement

---

## Section 7 — Sécurité (MFA/TOTP)

### Pourquoi elle existe
Protection des dossiers de coordination patients. MFA obligatoire pour le tier INTELLIGENCE et au-delà. Implémentation RFC 6238 TOTP.

### Machine d'états MFA (4 états)

```
DISABLED ──[Activer]──► SETUP_IN_PROGRESS
                              │
                    [Scanner QR + saisir code]
                              │
                              ▼
                           ENABLED ──[Désactiver]──► DISABLE_CONFIRM
                              ▲                           │
                              │                   [Confirmer désactivation]
                              └───────────────────────────┘
```

### État 1 : DISABLED
- Affiche un encart d'incitation à activer le MFA
- Bouton "Activer l'authentification à deux facteurs"
- Déclenche POST `/auth/totp/setup` → retourne `{ secret, qrCodeUrl }`

### État 2 : SETUP_IN_PROGRESS
- Affiche le QR code (base64 PNG) scannable avec Authy/Google Authenticator
- Affiche le code secret textuel (pour copier-coller)
- Champ pour saisir le code à 6 chiffres généré par l'app
- POST `/auth/totp/verify` avec `{ token: "123456" }`
- En cas d'échec : message d'erreur, le secret n'est pas encore enregistré (`totpPendingSecret` → nul si erreur)
- En cas de succès : `totpPendingSecret` → copié dans `totpSecret`, `totpEnabled = true`

### État 3 : ENABLED
- Affiche la date d'activation
- Badge "Authentification à deux facteurs activée"
- Bouton "Désactiver" → passage en état 4

### État 4 : DISABLE_CONFIRM
- Demande confirmation explicite + saisie du code TOTP courant
- POST `/auth/totp/disable` avec `{ token: "123456" }`
- Protège contre la désactivation accidentelle

### Flow login MFA
Quand MFA est activé, le login retourne `{ mfaPendingToken }` au lieu du JWT final.  
La page `/login` détecte ce token et affiche un step 2 (champ code 6 chiffres).  
POST `/auth/totp/login` avec `{ mfaPendingToken, token }` → retourne les JWT access + refresh.

**Point critique** : `totpSecret` est chiffré en base avec `encryptClinical` / `decryptClinical`. Ne jamais exposer le secret brut dans une réponse API.

### Champs schema concernés
```
ProviderProfile.totpEnabled        Boolean @default(false)
ProviderProfile.totpSecret         String?  (chiffré)
ProviderProfile.totpPendingSecret  String?  (chiffré, temporaire pendant setup)
```

---

## Section 8 — Compte

### Pourquoi elle existe
Gestion des informations du compte Nami (distinctes du profil professionnel).

### Ce qui existe
- Email de connexion (lecture seule — non modifiable dans l'UI actuelle)
- Date de création du compte
- Tier actuel (GRATUIT / ESSENTIEL / COORDINATION / INTELLIGENCE / RÉSEAU)
- Lien vers la gestion de l'abonnement (Stripe)

### Ce qui N'existe PAS (à ne pas inventer dans la refonte)
- ❌ Pas de changement de mot de passe dans l'UI (flux "mot de passe oublié" uniquement)
- ❌ Pas de suppression de compte en self-service (contact support)
- ❌ Pas de préférences de notifications dans cette section (pas encore implémenté)

---

## Section 9 — Confidentialité & RGPD

### Pourquoi elle existe
Obligation légale RGPD Art. 20 (portabilité des données) et Art. 17 (droit à l'effacement). Le soignant doit pouvoir exporter l'ensemble de ses données.

### Export des données
- Bouton "Exporter mes données"
- GET `/persons/{personId}/data-export`
- Retourne un fichier `export_rgpd_YYYY-MM-DD.json`
- Contient : profil, agenda, consultations, documents envoyés, messages, adressages
- Ne contient PAS les dossiers patients complets (ce sont des données tierces)

### Consentements IA
- Affiche la liste des traitements IA actifs sur le compte
- Possibilité de révoquer le consentement au traitement IA (désactive les synthèses IA sur le compte)
- Conforme à Art. 22 RGPD (décisions automatisées)

### Suppression de compte
- Pas de self-service — bouton "Contacter le support pour supprimer mon compte"
- Raison : suppression d'un compte soignant implique des actions manuelles (archivage RGPD des dossiers patients associés)

---

## Routes API

| Méthode | Endpoint | Usage |
|---------|----------|-------|
| GET | `/providers/me` | Charge tout le profil |
| PATCH | `/providers/me` | Sauvegarde les modifications (corps partiel) |
| POST | `/auth/totp/setup` | Initie le setup MFA → retourne `{ secret, qrCodeUrl }` |
| POST | `/auth/totp/verify` | Valide le code TOTP pendant le setup |
| POST | `/auth/totp/disable` | Désactive le MFA (requiert code TOTP courant) |
| POST | `/auth/totp/login` | Step 2 du login quand MFA actif |
| GET | `/persons/{personId}/data-export` | Export RGPD JSON |

---

## Schéma de données (champs clés)

```prisma
model ProviderProfile {
  // Identité
  firstName       String
  lastName        String
  title           String?
  specialty       String
  rpps            String?   // READ-ONLY après inscription
  adeli           String?   // READ-ONLY après inscription
  bio             String?
  languages       String[]
  
  // Exercice
  exerciseType    ExerciseType   // LIBERAL | SALARIED | MIXED
  conventionType  ConventionType
  
  // Agenda
  agendaBuffer        Int @default(15)
  agendaSmartCompact  Boolean @default(false)
  
  // Visibilité
  profileVisibility   ProfileVisibility @default(ALL)  // ALL | VERIFIED_ONLY | PRIVATE
  
  // MFA
  totpEnabled         Boolean @default(false)
  totpSecret          String?   // chiffré
  totpPendingSecret   String?   // chiffré, temporaire
}
```

---

## 10 points critiques à ne pas perdre dans la refonte

1. **RPPS et ADELI sont READ-ONLY** — ne jamais afficher ces champs comme modifiables, quel que soit le design.

2. **Barre de sauvegarde sticky** — ne pas fragmenter en "Enregistrer" par section. Le PATCH est unique et envoie tous les champs modifiés en une fois.

3. **MFA : 4 états distincts** — l'UI doit représenter 4 états de la machine, pas juste on/off. L'état SETUP_IN_PROGRESS avec QR code + validation est crucial.

4. **`profileVisibility` a un impact SEO direct** — c'est le seul champ qui contrôle l'indexation de `/soignants/[slug]`. Ne pas le simplifier en "profil public oui/non" — les 3 valeurs sont nécessaires (ALL/VERIFIED_ONLY/PRIVATE).

5. **Pas de changement de mot de passe** — ne pas créer une section "Sécurité > Mot de passe" qui n'existe pas côté backend.

6. **Agenda sur page séparée** — `/agenda/parametrage` gère les créneaux, horaires, types. `/reglages` ne gère que les préférences générales (buffer, compact). Mettre un lien clair vers `/agenda/parametrage`, pas dupliquer la logique.

7. **Export RGPD = obligation légale** — le bouton doit toujours être accessible et visible, même peu utilisé. Ne pas l'enfouir à 3 niveaux de profondeur.

8. **Structures d'exercice** — les structures viennent du Hub Réseau. Ne pas créer un champ texte libre "Établissement" ici — ça doit passer par la membership dans `/reseau`.

9. **`totpPendingSecret` vs `totpSecret`** — pendant le setup, le secret est stocké en pending jusqu'à validation du premier code. Si l'utilisateur abandonne le setup, pending est effacé. Ne pas traiter ces deux champs comme interchangeables.

10. **Aucune suppression de compte en self-service** — ni modale, ni bouton rouge "Supprimer mon compte". Uniquement un lien contact support. Toute suppression implique un process manuel RGPD côté Nami.
