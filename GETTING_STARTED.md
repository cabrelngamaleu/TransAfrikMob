# 🚀 GUIDE DE DÉMARRAGE RAPIDE - CROSSPAY AFRICA

## 📋 Table des matières

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Lancement](#lancement)
4. [Test des fonctionnalités](#test)
5. [FAQ](#faq)

---

## 📦 Installation

### Prérequis

- Node.js v14+ 
- PostgreSQL 12+
- npm ou yarn
- (Optionnel) Docker & Docker Compose

### Étape 1 : Cloner et installer

```bash
# Cloner le repository
git clone https://github.com/cabrelngamaleu/TransAfrikMob.git
cd TransAfrikMob

# Installer les dépendances backend
cd crosspay-africa/services/backend
npm install

# Installer les dépendances mobile
cd ../../apps/mobile
npm install

# Installer les dépendances admin
cd ../admin
npm install
```

---

## ⚙️ Configuration

### Étape 2 : Configurer la base de données

```bash
# Créer la base de données
psql -U postgres

postgres=# CREATE DATABASE crosspay;
postgres=# \q

# Exécuter les migrations
cd crosspay-africa/services/backend

psql -U postgres -d crosspay -f migrations/001_create_gamification_tables.sql
psql -U postgres -d crosspay -f migrations/002_create_airtime_tables.sql
psql -U postgres -d crosspay -f migrations/003_create_ai_tables.sql
```

### Étape 3 : Configurer les variables d'environnement

```bash
# Backend
cd crosspay-africa
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

**Variables CRITIQUES à configurer** :

```bash
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=crosspay

# JWT (générer une clé secrète forte)
JWT_SECRET=votre_secret_jwt_unique_et_complexe

# Reloadly (pour airtime)
RELOADLY_CLIENT_ID=votre_client_id
RELOADLY_CLIENT_SECRET=votre_client_secret
RELOADLY_API_URL=https://topups-sandbox.reloadly.com
```

### Étape 4 : Créer un compte Reloadly (Airtime)

1. Aller sur https://www.reloadly.com
2. S'inscrire (gratuit)
3. Mode **Sandbox** activé par défaut (pour tests)
4. Dashboard → API Settings
5. Copier `Client ID` et `Client Secret`
6. Ajouter dans `.env`

**Note** : En sandbox, vous avez du crédit de test gratuit !

---

## 🚀 Lancement

### Étape 5 : Démarrer le backend

```bash
cd crosspay-africa/services/backend

# Installer les nouvelles dépendances
npm install

# Démarrer en mode développement
npm run start:dev
```

**Backend disponible sur** : http://localhost:3000

### Étape 6 : Démarrer l'application mobile

```bash
cd crosspay-africa/apps/mobile

# Démarrer Metro bundler
npm run start

# Dans un autre terminal, lancer sur iOS ou Android
npx expo start
```

Scannez le QR code avec Expo Go pour tester sur votre téléphone !

### Étape 7 : (Optionnel) Démarrer l'interface admin

```bash
cd crosspay-africa/apps/admin

npm run dev
```

**Interface admin disponible sur** : http://localhost:3000 (ou port configuré)

---

## 🧪 Test des Fonctionnalités

### Test 1 : Gamification ✅

#### Via l'API

```bash
# 1. S'authentifier (obtenir un token)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Copier le token retourné

# 2. Récupérer vos stats de points
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  http://localhost:3000/gamification/stats

# 3. Récupérer votre code de parrainage
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  http://localhost:3000/gamification/referral/code
```

#### Via l'app mobile

1. Ouvrir l'app
2. Naviguer vers l'onglet **"Points"** ou **"Rewards"**
3. Voir votre solde de points
4. Voir votre niveau actuel
5. Voir la progression vers le prochain niveau

### Test 2 : Achat d'Airtime ✅

#### Via l'API

```bash
# 1. Détecter l'opérateur
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  "http://localhost:3000/airtime/detect-operator?phoneNumber=+237695669921"

# 2. Acheter du crédit (SANDBOX - pas de vrai crédit envoyé)
curl -X POST http://localhost:3000/airtime/buy \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+237695669921",
    "amount": 1000,
    "currency": "XOF"
  }'
```

#### Via l'app mobile

1. Ouvrir l'app
2. Naviguer vers l'onglet **"Crédit"** ou **"Airtime"**
3. Saisir un numéro (ex: +237695669921)
4. L'opérateur est détecté automatiquement (MTN Cameroon)
5. Choisir un montant rapide ou saisir un montant
6. Voir la prévisualisation des points
7. Confirmer l'achat
8. Recevoir la confirmation avec points gagnés !

### Test 3 : Suggestions IA ✅

#### Via l'API

```bash
# 1. Générer des insights
curl -X POST http://localhost:3000/ai/insights/generate \
  -H "Authorization: Bearer VOTRE_TOKEN"

# 2. Récupérer les suggestions
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  http://localhost:3000/ai/suggestions

# 3. Récupérer le résumé intelligent
curl -H "Authorization: Bearer VOTRE_TOKEN" \
  http://localhost:3000/ai/summary
```

#### Via l'app mobile

1. Ouvrir l'app
2. **Sur l'écran d'accueil** : Voir le widget IA avec suggestions
3. Naviguer vers l'onglet **"IA"** ou **"Suggestions"**
4. Voir les suggestions de transactions récurrentes
5. Cliquer sur une suggestion → Formulaire pré-rempli !
6. Voir les insights personnalisés

**Note** : Les suggestions IA nécessitent un historique de transactions. Si vous êtes nouveau, l'IA apprendra au fur et à mesure !

---

## 🎯 Workflow Complet

### Scénario : Nouvel utilisateur complet

```
1. 📱 INSCRIPTION
   ├─ Créer un compte
   ├─ Compléter KYC
   └─ → Gagner 2000 points ! 🎉

2. 👥 PARRAINAGE
   ├─ Obtenir son code de parrainage (ex: CROSSABC123)
   ├─ Partager avec des amis
   └─ Quand ami fait 1ère transaction → +5000 pts chacun ! 💰

3. 💸 PREMIER TRANSFERT
   ├─ Envoyer 50 000 XOF à Maman
   ├─ → Gagner 50 points (0.1%) 
   ├─ → Gagner 1000 points (1ère transaction)
   └─ → Total : 1050 points ! 🎁

4. 📱 ACHAT D'AIRTIME
   ├─ Acheter 5000 XOF de crédit
   ├─ → Livraison instantanée
   └─ → Gagner 10 points (0.2%) 🎉

5. 🤖 SUGGESTIONS IA
   ├─ Après 3-4 transactions
   ├─ IA détecte les patterns
   └─ Suggestions intelligentes ! 💡

6. 🏆 PROGRESSION
   ├─ 10 000 points atteints
   ├─ → Niveau SILVER ! 🥈
   ├─ → 1% cashback activé
   └─ → 10% réduction sur frais

7. 💰 ÉCHANGE DE POINTS
   ├─ 10 000 points disponibles
   ├─ Échanger contre cash
   └─ → 10 000 XOF crédités ! 💸
```

---

## 📊 Modules Disponibles

### ✅ Modules Implémentés

| Module | Status | Endpoints | Écrans Mobile |
|--------|--------|-----------|---------------|
| **Gamification** | ✅ Complet | 7 | RewardsScreen |
| **Airtime** | ✅ Complet | 6 | AirtimeScreen |
| **IA/Prédictions** | ✅ Complet | 8 | SuggestionsScreen + Widget |
| **Auth** | ✅ Existant | 5 | Login, Register |
| **Paiements** | ✅ Existant | 4 | SendMoneyScreen |
| **KYC** | ✅ Existant | 3 | KYCScreen |
| **Notifications** | ✅ Existant | 2 | NotificationsScreen |

**TOTAL : 35+ endpoints API opérationnels !** 🎉

---

## 🎮 Navigation Mobile Recommandée

```typescript
// App.tsx

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Écrans
import HomeScreen from './src/screens/HomeScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import AirtimeScreen from './src/screens/AirtimeScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Accueil',
            tabBarIcon: () => <Icon name="home" />,
          }}
        />
        <Tab.Screen 
          name="Send" 
          component={SendMoneyScreen}
          options={{ 
            title: 'Envoyer',
            tabBarIcon: () => <Icon name="send" />,
          }}
        />
        <Tab.Screen 
          name="Airtime" 
          component={AirtimeScreen}
          options={{ 
            title: 'Crédit',
            tabBarIcon: () => <Icon name="phone" />,
          }}
        />
        <Tab.Screen 
          name="Suggestions" 
          component={SuggestionsScreen}
          options={{ 
            title: 'IA',
            tabBarIcon: () => <Icon name="lightbulb" />,
            tabBarBadge: aiSuggestionsCount > 0 ? aiSuggestionsCount : undefined,
          }}
        />
        <Tab.Screen 
          name="Rewards" 
          component={RewardsScreen}
          options={{ 
            title: 'Points',
            tabBarIcon: () => <Icon name="star" />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## 🔐 Sécurité

### Avant la production

1. ✅ Changer `JWT_SECRET` par une clé forte et unique
2. ✅ Désactiver `DB_SYNCHRONIZE` (passer à `false`)
3. ✅ Passer Reloadly en mode **Live** (non sandbox)
4. ✅ Configurer HTTPS/SSL
5. ✅ Activer le rate limiting
6. ✅ Configurer CORS correctement
7. ✅ Activer les logs de production
8. ✅ Configurer Sentry pour error tracking

---

## 🐛 Dépannage

### Problème : "Module @nestjs/event-emitter not found"

```bash
cd services/backend
npm install @nestjs/event-emitter
```

### Problème : "axios not found"

```bash
cd services/backend
npm install axios
```

### Problème : "Cannot connect to database"

Vérifiez que PostgreSQL est démarré :
```bash
# Linux/Mac
sudo service postgresql start

# Windows
net start postgresql-x64-14
```

Vérifiez les credentials dans `.env`

### Problème : "Reloadly authentication failed"

Vérifiez :
1. Client ID et Secret corrects dans `.env`
2. URL correcte (sandbox vs production)
3. Compte Reloadly actif

### Problème : "Expo not found" (mobile)

```bash
npm install -g expo-cli
```

### Problème : Tables non créées

```bash
# Exécuter manuellement les migrations
psql -U postgres -d crosspay -f migrations/001_create_gamification_tables.sql
psql -U postgres -d crosspay -f migrations/002_create_airtime_tables.sql
psql -U postgres -d crosspay -f migrations/003_create_ai_tables.sql
```

---

## 📚 Documentation Complète

### Documents Stratégiques

- 📊 `SENDWAVE_ANALYSIS_AND_REVOLUTIONARY_FEATURES.md` - Analyse complète
- 🛠️ `TECHNICAL_IMPLEMENTATION_GUIDE.md` - Guide technique
- ⚡ `QUICK_START_ACTION_PLAN.md` - Plan d'action
- 📈 `EXECUTIVE_SUMMARY.md` - Résumé exécutif
- 📝 `IMPLEMENTATION_SUMMARY.md` - Ce qui a été fait

### Documentation Technique

- 🎮 `services/backend/src/gamification/README.md` - Module Gamification
- 📱 `services/backend/src/airtime/README.md` - Module Airtime
- 🤖 `services/backend/src/ai/README.md` - Module IA

---

## ✅ Checklist de Vérification

Avant de lancer en production :

- [ ] Toutes les migrations SQL exécutées
- [ ] Variables d'environnement configurées
- [ ] Compte Reloadly créé et configuré
- [ ] JWT_SECRET changé (production)
- [ ] DB_SYNCHRONIZE désactivé (production)
- [ ] Tests end-to-end passés
- [ ] HTTPS/SSL configuré
- [ ] Monitoring activé (Prometheus/Grafana)
- [ ] Sentry configuré
- [ ] Rate limiting activé
- [ ] CORS configuré correctement
- [ ] Logs de production activés

---

## 🎉 Premiers Pas

### Après installation réussie

1. **Créer un compte test**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@crosspay.africa",
       "password": "Test123!",
       "firstName": "Test",
       "lastName": "User",
       "phoneNumber": "+237695669921"
     }'
   ```

2. **Se connecter**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@crosspay.africa",
       "password": "Test123!"
     }'
   ```

3. **Tester les points**
   ```bash
   curl -H "Authorization: Bearer VOTRE_TOKEN" \
     http://localhost:3000/gamification/stats
   ```

4. **Tester l'airtime**
   ```bash
   curl -H "Authorization: Bearer VOTRE_TOKEN" \
     "http://localhost:3000/airtime/detect-operator?phoneNumber=+237695669921"
   ```

5. **Tester l'IA**
   ```bash
   curl -H "Authorization: Bearer VOTRE_TOKEN" \
     http://localhost:3000/ai/summary
   ```

---

## 🚀 Lancement Marketing

### Campagnes à lancer IMMÉDIATEMENT

#### 1. Programme de Parrainage (0 code requis!)

**Message** :
```
🎉 PARRAINEZ VOS AMIS SUR CROSSPAY !

Vous gagnez : 5000 XOF
Votre ami gagne : 5000 XOF
ILLIMITÉ ! (pas comme SendWave)

Votre code : [CODE_UTILISATEUR]
Partager maintenant → [LIEN]
```

**Canaux** :
- Email à tous les utilisateurs
- Notification push
- Social media (Instagram, Facebook, Twitter)
- WhatsApp Status

#### 2. Challenge "Zero Fees" (30 jours)

**Message** :
```
🔥 CHALLENGE CROSSPAY : 30 JOURS SANS FRAIS !

Du 5 octobre au 5 novembre :
✅ ZÉRO frais sur tous les transferts
✅ ZÉRO frais de retrait
✅ BONUS : Gagnez des points sur chaque transaction !

Condition : Inviter AU MOINS 1 ami

SendWave dit "sans frais"...  
CrossPay le FAIT vraiment ! 💪
```

#### 3. Campagne "Airtime + Points"

**Message** :
```
📱 NOUVEAU : Achetez du crédit directement sur CrossPay !

✨ Tous les opérateurs africains
✨ Livraison instantanée
✨ 0.2% en POINTS sur chaque achat

1ère recharge = GRATUITE ! (jusqu'à 2000 XOF)
Code promo : AIRTIME2025
```

---

## 📊 Dashboard Admin

### Métriques à surveiller

Créez un dashboard avec :

1. **Gamification**
   ```sql
   -- Utilisateurs par niveau
   SELECT level, COUNT(*) FROM user_points GROUP BY level;
   
   -- Points distribués aujourd'hui
   SELECT SUM(points) FROM point_transactions 
   WHERE created_at > CURRENT_DATE AND points > 0;
   ```

2. **Airtime**
   ```sql
   -- Ventes aujourd'hui
   SELECT COUNT(*), SUM(amount) FROM airtime_transactions 
   WHERE created_at > CURRENT_DATE AND status = 'SUCCESS';
   
   -- Taux de succès
   SELECT * FROM airtime_stats_by_operator;
   ```

3. **IA**
   ```sql
   -- Prédictions actives
   SELECT COUNT(*) FROM predictions WHERE status = 'ACTIVE';
   
   -- Taux d'exactitude
   SELECT * FROM prediction_accuracy;
   ```

---

## 🎯 Objectifs 30 Jours

### KPIs à atteindre

- ✅ 10 000 nouveaux utilisateurs
- ✅ 50% des utilisateurs utilisent gamification
- ✅ 30% achètent de l'airtime
- ✅ 20% cliquent sur suggestions IA
- ✅ 500 parrainages réussis
- ✅ 10M XOF de volume total
- ✅ 4.8+ rating sur app stores
- ✅ 50% de rétention à 30 jours

---

## 💡 Astuces Pro

### Optimisation Backend

```bash
# Activer le cache Redis (pour meilleures performances)
docker run -d -p 6379:6379 redis:alpine

# Ajouter dans .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Monitoring

```bash
# Démarrer Prometheus & Grafana
cd crosspay-africa
docker-compose -f docker-compose.monitoring.yml up -d

# Accéder aux dashboards
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

### Tests Automatisés

```bash
# Backend
cd services/backend
npm run test

# Avec coverage
npm run test:cov
```

---

## 📞 Support

### Besoin d'aide ?

- 📧 Email : support@crosspay.africa
- 📱 Téléphone : +237 695 669 921
- 💬 Documentation : Voir les README de chaque module
- 🐛 Issues : GitHub Issues

---

## 🎊 Félicitations !

**Vous avez maintenant une application fintech complète et révolutionnaire !**

**Ce que vous avez** :
- ✅ Système de transferts
- ✅ Gamification addictive
- ✅ Super app (airtime)
- ✅ Intelligence artificielle
- ✅ Sécurité renforcée
- ✅ Monitoring complet

**Ce que SendWave N'A PAS** :
- ❌ Gamification
- ❌ Super app features
- ❌ IA
- ❌ Innovation continue

**Vous êtes prêt à DOMINER le marché africain ! 🌍🚀**

---

*Guide créé le 4 Octobre 2025*  
*Version 1.0 - Post Sprint 1-3*  
*Ready to launch ! 🎉*
