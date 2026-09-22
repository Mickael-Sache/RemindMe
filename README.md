🇫🇷 Français | [🇬🇧 English](README.en.md)

# RemindMe

![CI](https://github.com/Mickael-Sache/RemindMe/actions/workflows/ci.yml/badge.svg)
![Angular](https://img.shields.io/badge/Angular-17+-dd0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular_Material-M3-757575?logo=material-design&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/licence-MIT-green)

> Application PWA de suivi des tâches quotidiennes avec rappels cycliques — jardin, piscine, animaux, santé et plus encore.

---

<!-- Remplacer par un screenshot ou un GIF du dashboard -->

![RemindMe Dashboard Dark](docs/screenshots/dashboard-dark.png)
![RemindMe Dashboard Light](docs/screenshots/dashboard-light.png)

---

## Fonctionnalités

- **Dashboard** — vue synthétique par catégorie avec statut visuel de chaque activité (à jour, bientôt dû, en retard)
- **Rappels cycliques** — cycle de répétition configurable par activité (1j, 3j, 7j, 14j, 30j…)
- **Vue calendrier** — suivi visuel des activités dans le temps avec coloration par statut
- **Notifications système** — alertes natives au démarrage via la Web Notifications API
- **Thèmes light / dark** — basculement dynamique, préférence persistée
- **Mode offline** — application entièrement utilisable sans connexion (Service Worker)
- **Installable** — PWA installable sur desktop (Windows / macOS) et mobile (Android / iOS)
- **Export / Import** — sauvegarde et restauration des données en JSON

---

## Stack technique

| Couche        | Technologie                                      |
| ------------- | ------------------------------------------------ |
| Framework     | Angular 17+ — Standalone Components, Signals     |
| UI            | Angular Material Design 3                        |
| Langage       | TypeScript 5.x                                   |
| Stockage      | IndexedDB via Dexie.js                           |
| Styles        | SCSS + CSS Custom Properties                     |
| PWA           | @angular/pwa — Service Worker + Web App Manifest |
| Notifications | Web Notifications API                            |
| Bundler       | ESBuild                                          |
| Qualité       | ESLint, Jasmine, GitHub Actions CI               |
| Accessibilité | RGAA 4.1.2                                       |

---

## Architecture

Organisation **feature-based** avec **Standalone Components** (Angular 17+).

```
src/app/
├── core/               # Services singleton, modèles, base Dexie
│   ├── db/             # Définition IndexedDB (AppDatabase)
│   ├── models/         # Interfaces TypeScript (Category, Activity, User)
│   └── services/       # ActivityService, ThemeService, NotificationService…
├── features/           # Fonctionnalités métier isolées
│   ├── dashboard/      # Écran principal (Smart component)
│   ├── calendar/       # Vue calendrier
│   ├── categories/     # Gestion des catégories
│   └── settings/       # Profil et paramètres
├── layout/             # Squelette visuel (Header, Sidebar, BottomNav)
└── shared/             # Composants, pipes et directives réutilisables
```

**Patterns appliqués**

- **Smart / Dumb components** — séparation logique métier / présentation
- **Lazy loading des routes** — chargement à la demande pour de meilleures performances PWA
- **Angular Signals** — réactivité moderne sans boilerplate RxJS
- **Dexie.js versioning** — migrations de schéma IndexedDB gérées proprement

---

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org) v20 ou v22 (LTS)
- [Angular CLI](https://angular.dev/tools/cli) v17+

```bash
npm install -g @angular/cli
```

### Installation

```bash
# Cloner le repo
git clone https://github.com/Mickael-Sache/RemindMe.git
cd RemindMe

# Installer les dépendances
npm install

# Lancer en développement
ng serve
```

L'application est accessible sur [http://localhost:4200](http://localhost:4200)

### Build production

```bash
ng build --configuration=production
```

Les fichiers compilés sont générés dans `dist/remindme/browser/`.

> Le Service Worker n'est actif qu'en mode production. Pour tester le mode offline localement :
>
> ```bash
> npx serve dist/remindme/browser
> ```

### Tests

```bash
# Tests unitaires
ng test

# Linting
ng lint
```

---

## Pipeline CI

Chaque push sur `main` ou `develop` déclenche automatiquement :

| Étape            | Commande                                          |
| ---------------- | ------------------------------------------------- |
| Installation     | `npm ci`                                          |
| Lint             | `ng lint`                                         |
| Tests unitaires  | `ng test --watch=false --browsers=ChromeHeadless` |
| Build production | `ng build --configuration=production`             |

---

## Roadmap

- [x] Dashboard avec statut des activités
- [x] Formulaires catégories et activités
- [x] Vue calendrier
- [x] Paramètres et profil utilisateur
- [x] Thèmes light / dark
- [x] Stockage IndexedDB (Dexie.js)
- [x] PWA — offline et installable
- [x] Notifications système
- [x] Pipeline CI/CD (GitHub Actions)
- [ ] Animations et micro-interactions
- [ ] Tests unitaires complets
- [ ] Accessibilité WCAG AA

---

## Licence

Distribué sous licence MIT. Voir [`LICENSE`](LICENSE) pour plus d'informations.

---

_[Mickaël Saché](https://www.linkedin.com/in/mickaël-saché) — mickael.sache@gmail.com_
