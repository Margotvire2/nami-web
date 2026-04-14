# Conformité MDR/DM — Intégration dans le pitch

## Règle fondamentale

La page `/pitch` est lue par des investisseurs VC, potentiellement aussi des journalistes et des concurrents.  
**Tout mot qui positionne Nami comme dispositif médical est un risque réglementaire ET un red flag pour le VC.**

---

## Mots interdits dans le pitch (et partout dans l'UI)

| ❌ À bannir | ✅ Alternative |
|-----------|---------------|
| Alerte clinique | Indicateur de complétude |
| Surveillance / Monitoring clinique | Organisation du suivi |
| Détecter une dégradation | Observer l'évolution |
| Risque patient | Priorité de coordination |
| Scoring de risque | Complétude du dossier |
| Diagnostic assisté par IA | Extraction de données (brouillon) |
| Alerter le médecin | Notifier l'équipe |
| Prévenir une rechute | Structurer le suivi longitudinal |
| Système d'aide à la décision médicale | Outil de coordination |

---

## Ce que Nami EST (conforme MDR)

```
✅ Outil de coordination entre professionnels de santé
✅ Centralisation et partage d'informations cliniques
✅ Organisation des parcours de soins pluridisciplinaires
✅ Communication sécurisée entre soignants
✅ Gestion de l'agenda et des rendez-vous
✅ Extraction IA de données → brouillon → validation humaine obligatoire
```

## Ce que Nami N'EST PAS (à formuler explicitement si question VC)

```
❌ Dispositif médical (pas de CE marquage nécessaire pour les features actuelles)
❌ Système d'aide à la décision médicale autonome
❌ Outil de télémédecine (pas d'actes médicaux à distance)
❌ Logiciel de prescription
```

---

## Formulations pitch conformes

### Pour décrire l'IA
> "Nami extrait automatiquement des données structurées à partir des notes cliniques — **brouillon soumis à validation du soignant**, jamais intégré automatiquement au dossier."

### Pour décrire les alertes
> "Le soignant peut paramétrer des **indicateurs de complétude** — par exemple, signaler qu'un bilan biologique est en attente depuis plus de 30 jours."

### Pour décrire la coordination
> "Nami centralise l'information et **organise la communication** entre les membres de l'équipe soignante autour d'un dossier partagé."

### Pour décrire la valeur clinique
> "Les soignants **observent l'évolution** du patient dans le temps — poids, humeur, alimentation — et peuvent **noter** ce qu'ils souhaitent partager avec l'équipe."

---

## Positionnement réglementaire à tenir dans le pitch

> "Nami est un **outil de coordination et d'organisation** — pas un dispositif médical. Nos fonctionnalités actuelles n'entrent pas dans le champ du règlement MDR (UE 2017/745). La certification HDS (Hébergement Données de Santé) est notre prochaine étape réglementaire, que nous visons à [date]."

Cette formulation :
- Rassure le VC sur l'absence de risque réglementaire immédiat
- Montre la maturité : on connaît la réglementation
- Ouvre la porte à la vision long terme (HDS = crédibilité établissement)

---

## Cas particuliers

### L'appel à projets HAP / obésité
- Formuler comme : "coordination pluridisciplinaire des parcours d'obésité complexe"
- Ne pas dire "protocole de traitement" ou "suivi médical automatisé"
- Insister sur : parcours, équipe pluridisciplinaire, traçabilité de la coordination

### Les données de santé
- Toujours préciser : "données hébergées sur infrastructure certifiée HDS (en cours)"
- Mentionner RGPD dès que données patients évoquées
- Ne pas dire "base de données médicales" → "base de connaissances cliniques pour soignants"

### L'IA
- "Claude (Anthropic)" comme moteur — pas "notre IA propriétaire"
- Extraction + brouillon + validation humaine = le flux obligatoire
- Pas de "l'IA détecte" ou "l'IA recommande"

---

## Disclaimer footer de la page /pitch

```
Nami est un outil de coordination et d'organisation des parcours de soins.
Il ne constitue pas un dispositif médical au sens du règlement (UE) 2017/745.
Aucune information fournie ne constitue un avis médical.
```
