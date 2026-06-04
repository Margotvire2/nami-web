# F-VISIO-TELECONSULTATION — Phase 0 : reco SDK vidéo

**Date** : 2026-06-04
**Auteur** : Phase 0 audit
**Statut** : reco à valider par Margot AVANT impl V1
**Périmètre** : sélection d'un SDK vidéo pour téléconsultation Nami (web + mobile React Native)

---

## 1. Executive summary

### Reco finale : **LiveKit self-hosted sur hébergeur HDS (Scaleway ou OVH)**

**TL;DR justif (5 lignes)** :
- LiveKit est le seul SDK open-source moderne qui combine SFU performant, E2EE production-grade, SDK React Native officiel maintenu et déploiement Docker simple.
- Le **Cloud LiveKit** est hébergé aux US → **non éligible HDS** → seule l'option **self-host** est compatible avec les exigences santé françaises.
- Auto-hébergé sur **Scaleway Elements** (Paris, HDS-certifié) ou **OVHcloud** (Roubaix/Gravelines, HDS-certifié), Nami garde le contrôle full stack (SFU + TURN + signaling).
- Pas de lock-in commercial : si le besoin évolue (volume × 10), bascule possible vers Cloud LiveKit Enterprise avec BAA équivalent ou autre fournisseur conforme.
- Coût marginal Phase 1 ~30-60 €/mois infra (1 instance dev/staging) vs SaaS US qui sortent à 100-500 €/mois pour usage équivalent et qui sont disqualifiés HDS.

### Alternatives disqualifiées (résumé)

| SDK | Disqualification |
|-----|------------------|
| Twilio Video / Programmable Video | EOL annoncé le 5 décembre 2024, nouveau dev impossible |
| Daily.co | Hébergeurs AWS US, pas HDS-certifié, sortie data UE non garantie |
| Whereby Embedded | Hébergeur AWS UE mais pas HDS-certifié, DPA OK mais conformité santé FR insuffisante |
| Vonage Video API (ex-OpenTok) | Racheté par Ericsson, roadmap incertaine, pas HDS, lock-in fort |
| Jitsi self-host | Viable mais SDK React Native (`react-native-jitsi-meet`) sous-maintenu vs LiveKit |

---

## 2. Comparatif 6 produits × 5 critères

| Critère | LiveKit (self-host) | Jitsi (self-host) | Daily.co | Whereby Embedded | Twilio Video | Vonage Video |
|---|---|---|---|---|---|---|
| **RGPD / HDS** | ✅ Full contrôle si hébergement Scaleway/OVH HDS | ✅ Idem self-host | ❌ AWS US, pas HDS | ⚠️ AWS UE, DPA OK, pas HDS-certifié | ❌ EOL, hors sujet | ⚠️ Régions UE possibles, pas HDS |
| **SDK React Native** | ✅ `@livekit/react-native` officiel, maintenu 2026 | ⚠️ `react-native-jitsi-meet` communautaire, sporadique | ✅ `@daily-co/react-native-daily-js` maintenu | ⚠️ WebView wrapper, pas SDK natif | ❌ Discontinued | ⚠️ SDK existant mais legacy Ericsson |
| **E2EE** | ✅ Insertable streams (Chrome/Edge/Safari iOS 17+) | ⚠️ DTLS-SRTP par défaut, E2EE expérimentale | ⚠️ Daily E2EE en bêta, non recommandé prod healthtech | ❌ Pas d'E2EE annoncée | ❌ N/A | ⚠️ E2EE seulement sur Tier Premium |
| **Recording compliance** | ✅ Désactivable par config, opt-in API explicite | ✅ Configurable Jibri, désactivable | ⚠️ Recording cloud activable accidentellement | ⚠️ Recording inclus par défaut sur certains plans | ❌ N/A | ⚠️ Archiving par défaut sur compte |
| **Pricing** | Open-source gratuit ; infra ~30-60 €/mois (Phase 1) | Open-source gratuit ; infra ~30-60 €/mois | $0.004/min participant ; vite >300 €/mois | ~$0.004/min ; tarif équivalent | EOL | ~$0.0047/min |

**Score Nami (1-5)** :
- **LiveKit self-host : 5/5** (seul setup tout-vert)
- Jitsi self-host : 3/5 (RN immature)
- Daily.co : 2/5 (HDS bloque)
- Whereby : 2/5 (pas HDS)
- Twilio : 0/5 (EOL)
- Vonage : 1/5 (HDS bloque + lock-in)

---

## 3. Détail par produit

### 3.1 LiveKit (open-source, self-hostable)

- **Repo** : https://github.com/livekit/livekit (Go, ~10k stars, actif)
- **Hébergement** : Cloud LiveKit (US, AWS) **OU** self-host Docker/Kubernetes
- **HDS** : Cloud disqualifié ; **self-host sur Scaleway Elements ou OVHcloud HDS = compatible**
- **SDK React Native** : `@livekit/react-native` + `@livekit/react-native-webrtc`, officiel, releases mensuelles, iOS + Android
- **SDK Web** : `livekit-client` (JS/TS), API stable, hooks React via `@livekit/components-react`
- **E2EE** : Insertable Streams natifs (Chrome 113+, Safari 17+), API simple via `e2ee: { keyProvider }`
- **Recording compliance** : Egress service séparé, désactivable par config, opt-in explicite par API
- **Pricing** : Open-source gratuit. Self-host : ~30-60 €/mois pour 1 instance Scaleway DEV1-M (3 vCPU, 4 GB RAM) → suffit pour ~50 participants simultanés Phase 1
- **Audit log** : événements room/participant/track exposés via Server SDK, hookable dans audit log Nami
- **Verdict** : **✅ Reco finale** — seul setup tout-vert pour healthtech FR

### 3.2 Jitsi Meet (Atlassian/8x8, open-source)

- **Repo** : https://github.com/jitsi/jitsi-meet (~24k stars)
- **Hébergement** : SaaS 8x8 (US) **OU** self-host JVB + Prosody + Jicofo
- **HDS** : SaaS 8x8 non HDS ; self-host sur Scaleway/OVH HDS possible
- **SDK React Native** : `react-native-jitsi-meet` communautaire, dernière release ~2023, peu maintenu en 2026
- **E2EE** : DTLS-SRTP par défaut entre clients et JVB ; E2EE bout-en-bout encore expérimentale (insertable streams en cours)
- **Recording compliance** : Jibri (composant séparé), désactivable
- **Pricing** : Open-source gratuit. Infra équivalente LiveKit (~30-60 €/mois)
- **Verdict** : ⚠️ Viable techniquement mais l'écart React Native pénalise — Nami a besoin d'un mobile robuste J+90

### 3.3 Daily.co

- **Hébergement** : SaaS AWS (US-East-1 par défaut, UE en option)
- **HDS** : ❌ pas HDS-certifié — sortie de zone HDS non garantie même sur région UE
- **SDK React Native** : `@daily-co/react-native-daily-js`, officiel, maintenu
- **E2EE** : en bêta privée, non recommandée pour healthtech production
- **Recording compliance** : recording cloud activable côté plateforme, log explicite recommandé
- **Pricing** : free tier 1000 min/mois puis $0.004/min participant → pour 50 consults × 30 min × 2 participants = $12 puis vite > 100 €/mois
- **Verdict** : ❌ **Disqualifié HDS** — sauf dérogation explicite ANSI, ne convient pas

### 3.4 Whereby Embedded

- **Hébergement** : AWS UE (Frankfurt + Ireland)
- **HDS** : ⚠️ DPA RGPD OK, mais **pas de certification HDS française**. Healthtech française = HDS quasi obligatoire à terme.
- **SDK React Native** : pas de SDK natif, intégration via WebView (UX dégradée)
- **E2EE** : pas d'E2EE annoncée
- **Recording compliance** : recording inclus dans certains plans, à configurer pour désactiver
- **Pricing** : équivalent Daily.co
- **Verdict** : ❌ Disqualifié (HDS + SDK RN faible)

### 3.5 Twilio Video / Programmable Video

- **Statut 2026** : **End of Life depuis le 5 décembre 2024**. Twilio recommande migration vers partenaires (Zoom, Daily, etc.)
- **Verdict** : ❌ **Hors sujet** — pas de nouveau dev possible

### 3.6 Vonage Video API (ex-OpenTok)

- **Hébergement** : régions UE disponibles, mais pas HDS-certifié
- **Acquisition** : racheté par Ericsson 2022, intégré à la plateforme CPaaS Ericsson Enterprise Wireless Solutions
- **SDK React Native** : `@vonage/client-sdk-video-react-native`, SDK existant mais hérité OpenTok
- **E2EE** : seulement sur Tier Premium
- **Recording compliance** : archiving par défaut activé sur certains comptes
- **Pricing** : ~$0.0047/min
- **Verdict** : ⚠️ Risque roadmap Ericsson + pas HDS → ❌ pour Nami

---

## 4. Architecture cible

### 4.1 Topologie SFU vs MCU vs P2P

- **P2P (mesh)** : OK pour 1-1, écroule au-delà de 3 participants. Pas retenu (RCP Nami = 4-6 participants).
- **MCU** : serveur compose le mix vidéo → bande passante client basse mais CPU serveur élevé. Pas retenu (coût infra non linéaire).
- **SFU** : serveur route les flux sans transcoder → scale horizontal, latence basse, E2EE possible. **Retenu : LiveKit Server (SFU Go performant).**

### 4.2 Topologie infra Nami (Phase 1)

```
Patient/Soignant (Web Next.js + Mobile RN)
    ↕ WebSocket signaling (WSS)
    ↕ WebRTC media (UDP/TCP)
LiveKit Server (Docker)
    ├─ Scaleway Elements DEV1-M (Paris, HDS-certifié)
    │  ou OVHcloud B2-7 (Roubaix, HDS-certifié)
    ├─ TURN server intégré (coturn embedded)
    └─ JWT signing key (HMAC-SHA256)

Audit log + observability
    → Nami backend (Express) reçoit webhooks LiveKit
    → PostgreSQL: VisioSession (createdAt, participants, durationSec)
    → Sentry : erreurs connect/disconnect (PHI-filtered)
```

### 4.3 E2EE — activation

- LiveKit utilise les **Insertable Streams** WebRTC pour E2EE
- Compatibilité 2026 : Chrome 113+, Edge, Firefox 110+, Safari iOS 17+, React Native via `@livekit/react-native-webrtc`
- **Clé E2EE dérivée d'un secret partagé** propre à chaque room, envoyée hors-bande (via JWT token signé Nami) → Nami ne stocke pas la clé en clair
- Fallback gracieux si client legacy : refus de join + message explicite (pas de downgrade silencieux)

### 4.4 Recording — politique stricte

- **Désactivé par défaut** (`recordingEnabled: false` côté serveur LiveKit)
- Pas d'Egress service déployé en Phase 1
- Si Phase 2 active recording : opt-in explicite avec **consentement Art. L.1110-12 CSP** capturé en DB (ConsentEvent) avant démarrage de la room

---

## 5. Plan d'intégration future (V1, post-Phase 0)

⚠️ **Ne PAS implémenter en Phase 0**. Cette section documente le chemin pour le ticket Notion F-VISIO-TELECONSULTATION-IMPL-V1.

### 5.1 Extension data model (backend `/nami`)

```prisma
enum AppointmentType {
  IN_PERSON      // existant
  TELECONSULTATION  // NEW
}

model Appointment {
  // existant ...
  type AppointmentType @default(IN_PERSON)
  visioSession VisioSession?
}

model VisioSession {
  id            String   @id @default(cuid())
  appointmentId String   @unique
  roomName      String   @unique  // ex: nami-app-{appointmentId}
  createdAt     DateTime @default(now())
  endedAt       DateTime?
  durationSec   Int?
  participantCount Int   @default(0)
  e2eeEnabled   Boolean  @default(true)
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
}
```

### 5.2 Backend routes

- `POST /api/visio/rooms` (auth: soignant ou patient invité) → crée room LiveKit + retourne JWT signé (TTL 1h)
- `POST /api/visio/webhooks/livekit` (signature LiveKit verified) → met à jour VisioSession (endedAt, durée, participantCount)
- `GET /api/visio/sessions?appointmentId=...` → liste sessions historiques (audit log)

### 5.3 Frontend cockpit (nami-web)

- Bouton "Lancer visio" dans la page `appointment/[id]` quand `type === TELECONSULTATION`
- Page `/visio/room/[appointmentId]` avec `@livekit/components-react` → join automatique avec token reçu
- Layout RCP multi-participants : tile grid auto-resize

### 5.4 Mobile React Native (nami-mobile)

- Composant `<VisioRoom appointmentId={...} />` utilisant `@livekit/react-native`
- Permissions camera + micro avec rationale explicite
- Mode picture-in-picture iOS/Android

### 5.5 Observability + audit

- Webhook LiveKit `participant_joined`, `participant_left`, `room_finished` → audit log Nami
- Sentry tags : `visio.session_id`, `visio.appointment_id` (pas de PII)
- Metric Prometheus : `nami_visio_sessions_active`, `nami_visio_session_duration_seconds`

---

## 6. Risques + open questions Margot

### 6.1 Risques identifiés

| # | Risque | Mitigation |
|---|--------|-----------|
| R1 | **Ops self-host** — Nami doit gérer onboarding LiveKit Server (oncall infra) | Docker Compose simple, runbook ; en cas de pic, monitoring Sentry + Uptime Kuma |
| R2 | **Compatibilité E2EE Safari** — Safari < 17 ne supporte pas Insertable Streams | Détection navigateur + message explicite refus join ; ne pas downgrader |
| R3 | **Bande passante coût** — chaque session SFU sort en upload data vers serveur | Scaleway/OVH facturent généralement pas l'egress UE→UE ; à vérifier au-delà de 1 TB/mois |
| R4 | **Choix Scaleway vs OVH** — les deux sont HDS mais latence ≠, gestion différente | POC bench Scaleway DEV1-M vs OVH B2-7 en Phase 1, choisir sur RTT mesuré |
| R5 | **Recording un jour** — pression utilisateurs/légal pour activer plus tard | Workflow opt-in strict avec ConsentEvent ; ne JAMAIS activer par défaut |

### 6.2 Open questions pour Margot

1. **Hébergeur retenu** : Scaleway Elements (Paris) ou OVHcloud (Roubaix) ? Reco : Scaleway pour latence Paris, OVH pour catalogue HDS plus mature.
2. **E2EE obligatoire ou opt-in ?** Reco : obligatoire dès V1 (pas de fallback silencieux). Trade-off : exclut clients legacy < iOS 17 / < Chrome 113.
3. **Max participants par room** : limiter à 10 pour V1 (couvre RCP) ou 50 (couvre webinars formation patient) ?
4. **Recording activable un jour ?** Reco : NON en V1, à rediscuter Phase 3 avec consultation juridique dédiée.
5. **Budget infra mensuel ciblé** : 30 € (1 instance dev partagée avec staging) ou 100 € (2 instances dédiées prod + staging) ?

---

## 7. Phase 0 — preuves livrées

- ✅ Comparatif 6 SDKs × 5 critères
- ✅ Reco argumentée + risques
- ✅ POC technique : `src/app/(cockpit)/visio-test/page.tsx` (join/leave room LiveKit, video local + remote, état session, gestion erreur env vars manquantes)
- ✅ Tests Vitest : `src/app/(cockpit)/visio-test/__tests__/page.test.tsx` (import SDK + instanciation Room)
- ✅ Doc d'intégration V1 (chemin clair pour ticket impl)

## 8. Prochaines actions (Margot)

1. Lire ce doc + valider la reco LiveKit self-host
2. Trancher les 5 open questions §6.2
3. Tester POC localement : `npm run dev` → `/visio-test` (avec `NEXT_PUBLIC_LIVEKIT_URL` + `NEXT_PUBLIC_LIVEKIT_POC_TOKEN` ; cf README LiveKit pour générer un token de test)
4. Créer ticket Notion **F-VISIO-TELECONSULTATION-IMPL-V1** avec :
   - Spec data model (§5.1)
   - Spec routes backend (§5.2)
   - Spec frontend + mobile (§5.3, 5.4)
   - Effort estimé : ~3 semaines × 1 dev (backend + frontend + RN)
5. Provisionner instance Scaleway/OVH HDS pour staging visio
