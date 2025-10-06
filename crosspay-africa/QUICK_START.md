# 🚀 Guide de Démarrage Rapide - CrossPay Africa

**Tout ce que vous devez savoir pour commencer** 

---

## ⚡ Installation en 3 Minutes

### Étape 1: Installer les dépendances
```bash
cd /workspace/crosspay-africa
npm install
```

### Étape 2: Configurer Git Hooks
```bash
npm run prepare
```

### Étape 3: C'est tout ! 🎉
Les hooks Git et les configurations sont maintenant actifs.

---

## 🔧 Activer GitHub Actions (CI/CD)

### 1. Configurer les Secrets GitHub

Allez dans **Settings** → **Secrets and variables** → **Actions** et ajoutez:

```bash
# Optionnel - Pour Docker Hub
DOCKER_USERNAME=votre-username
DOCKER_PASSWORD=votre-password

# Optionnel - Pour Codecov
CODECOV_TOKEN=votre-token-codecov
```

### 2. Activer GitHub Actions

1. Allez dans l'onglet **Actions** de votre repository
2. Cliquez sur "**I understand my workflows, go ahead and enable them**"
3. C'est fait ! Le pipeline s'exécutera automatiquement sur chaque push

---

## 🧪 Exécuter les Tests

### Tests Unitaires (100% passent ✅)
```bash
# Tous les tests
npm run test

# Avec couverture
npm run test:coverage

# Par composant
cd services/backend && npm test      # Backend (45 tests)
cd apps/admin && npm test            # Admin (13 tests)
cd apps/mobile && npm test           # Mobile (13 tests)
```

### Tests E2E (29 tests ✅)
```bash
# Installation de Playwright (une seule fois)
npm install
npx playwright install

# Exécuter les tests
npm run test:e2e

# Mode interactif (recommandé)
npm run test:e2e:ui

# Un navigateur spécifique
npx playwright test --project=chromium
```

---

## 🔒 Utiliser les Git Hooks

### Pre-commit (Automatique)
Avant chaque commit, le code est automatiquement:
- ✅ Linté avec ESLint
- ✅ Formatté avec Prettier

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
# ↑ Le hook s'exécute automatiquement
```

### Pre-push (Automatique)
Avant chaque push, tous les tests sont exécutés:
- ✅ Tests Backend (45 tests)
- ✅ Tests Admin (13 tests)
- ✅ Tests Mobile (13 tests)

```bash
git push origin main
# ↑ Les tests s'exécutent automatiquement
# Le push est bloqué si un test échoue
```

### Format des Messages de Commit
Les messages doivent suivre le format **Conventional Commits**:

```bash
# ✅ Valides
git commit -m "feat: ajout du paiement mobile money"
git commit -m "fix: correction du bug de connexion"
git commit -m "docs: mise à jour du README"

# ❌ Invalides
git commit -m "adding stuff"
git commit -m "fix bug"
git commit -m "UPPERCASE COMMIT"
```

**Types autorisés**:
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `style` - Formatage du code
- `refactor` - Refactoring
- `perf` - Amélioration de performance
- `test` - Ajout de tests
- `build` - Build système
- `ci` - CI/CD
- `chore` - Maintenance
- `revert` - Revert

---

## 📊 Voir la Couverture de Code

### Backend
```bash
cd services/backend
npm run test:cov
# Ouvrir coverage/lcov-report/index.html
```

### Admin
```bash
cd apps/admin
npm test -- --coverage
# Ouvrir coverage/lcov-report/index.html
```

### Mobile
```bash
cd apps/mobile
npm test -- --coverage
# Ouvrir coverage/lcov-report/index.html
```

---

## 🎨 Qualité du Code

### Linting
```bash
# Vérifier tout le projet
npm run lint

# Vérifier un composant
cd services/backend && npm run lint
cd apps/admin && npm run lint
```

### Formatage
```bash
# Formatter tout le projet
npm run format

# Vérifier le formatage
npm run format:check
```

---

## 🐳 Docker (Optionnel)

### Démarrer les services
```bash
# Infrastructure complète
docker-compose up -d

# Monitoring (Prometheus + Grafana)
docker-compose -f docker-compose.monitoring.yml up -d
```

### Arrêter les services
```bash
docker-compose down
docker-compose -f docker-compose.monitoring.yml down
```

---

## 📖 Documentation

### Rapports Générés
- `RAPPORT_VERIFICATION.md` - Vérification complète du projet
- `RAPPORT_TESTS_100.md` - Détails des 100 tests
- `TEST_COMMANDS.md` - Guide des commandes
- `IMPLEMENTATION_COMPLETE.md` - Documentation complète
- `QUICK_START.md` - Ce guide

### Accéder aux Interfaces (en développement)
```bash
# Démarrer le backend
cd services/backend && npm run start:dev
# → http://localhost:3000

# Démarrer l'admin
cd apps/admin && npm run dev
# → http://localhost:4000

# Démarrer l'app mobile
cd apps/mobile && npm start
# → Suivre les instructions Expo
```

---

## 🚨 Dépannage

### Les hooks Git ne fonctionnent pas
```bash
# Réinstaller Husky
npm run prepare
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

### Playwright ne s'installe pas
```bash
# Installation manuelle
npx playwright install --with-deps
```

### Les tests échouent
```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install

# Vérifier la configuration
cd services/backend && npm test
cd apps/admin && npm test
cd apps/mobile && npm test
```

---

## 🎯 Workflow de Développement Recommandé

### 1. Créer une branche
```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Développer
```bash
# Vos modifications...
git add .
git commit -m "feat: ajout de ma fonctionnalité"
# ↑ Pre-commit s'exécute automatiquement
```

### 3. Tester
```bash
npm run test
npm run test:e2e
```

### 4. Pousser
```bash
git push origin feature/ma-nouvelle-fonctionnalite
# ↑ Pre-push s'exécute automatiquement
```

### 5. Créer une Pull Request
- GitHub Actions s'exécute automatiquement
- Tous les tests doivent passer ✅
- Merger dans `main` ou `develop`

---

## 📊 Statistiques du Projet

```
✅ 100 tests (71 unitaires + 29 E2E)
✅ 91.8% de couverture de code
✅ Pipeline CI/CD avec 9 jobs
✅ 6 navigateurs testés en E2E
✅ 4 rapports de documentation
✅ 24 fichiers de configuration
```

---

## 🆘 Besoin d'Aide ?

### Documentation
1. Lire `IMPLEMENTATION_COMPLETE.md`
2. Consulter `TEST_COMMANDS.md`
3. Vérifier `RAPPORT_TESTS_100.md`

### Support
- 📧 Email: support@crosspay.africa
- 📱 Téléphone: +237 695 669 921
- 🌐 Site: www.crosspay.africa

---

## ✅ Checklist Quotidienne

Avant de commencer votre journée:
- [ ] `git pull` pour récupérer les dernières modifications
- [ ] `npm install` si les dépendances ont changé
- [ ] `npm run test` pour vérifier que tout fonctionne

Avant de terminer:
- [ ] `npm run lint` pour vérifier la qualité
- [ ] `npm run test` pour vérifier les tests
- [ ] `git commit` avec un message conventionnel
- [ ] `git push` (les tests s'exécutent automatiquement)

---

**🎉 Vous êtes prêt à développer avec CrossPay Africa !**

*Guide mis à jour le 2025-10-06*
