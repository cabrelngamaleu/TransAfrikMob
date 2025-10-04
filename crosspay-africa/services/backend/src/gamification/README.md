# 🎮 Module de Gamification CrossPay Africa

## 📋 Vue d'ensemble

Le module de gamification transforme CrossPay Africa en une expérience engageante et récompensante pour les utilisateurs. Il comprend :

- **Système de points** : Les utilisateurs gagnent des points sur chaque transaction
- **Niveaux de fidélité** : 5 niveaux (Bronze → Silver → Gold → Platinum → Diamond)
- **Programme de parrainage** : 5000 points pour le parrain ET le filleul
- **Badges** : Récompenses pour achievements spécifiques
- **Échange de points** : 1 point = 1 XOF

---

## 🏗️ Architecture

### Entités

- `UserPoints` : Solde et niveau de chaque utilisateur
- `PointTransaction` : Historique des points gagnés/dépensés
- `Badge` : Définition des badges disponibles
- `UserBadge` : Badges gagnés par les utilisateurs
- `Referral` : Suivi des parrainages

### Services

- `PointsService` : Gestion des points et niveaux
- `ReferralService` : Gestion du système de parrainage

---

## 🎯 Règles de Points

### Actions récompensées

| Action | Points |
|--------|--------|
| Envoyer de l'argent | 0.1% du montant |
| Recevoir de l'argent | 0.05% du montant |
| Parrainage réussi | 5000 points |
| Vérification KYC | 2000 points |
| Première transaction | 1000 points |
| Connexion quotidienne | 10 points |
| Streak 7 jours | 100 points |
| Streak 30 jours | 500 points |
| Achat d'airtime | 0.2% du montant |
| Paiement de facture | 0.2% du montant |

### Niveaux de Fidélité

| Niveau | Points requis | Cashback | Réduction frais |
|--------|---------------|----------|-----------------|
| 🥉 Bronze | 0 - 10 000 | 0.5% | 0% |
| 🥈 Silver | 10 000 - 50 000 | 1% | 10% |
| 🥇 Gold | 50 000 - 200 000 | 2% | 25% |
| 💎 Platinum | 200 000 - 1M | 3% | 50% |
| 👑 Diamond | 1M+ | 5% | 100% (gratuit!) |

---

## 🚀 Utilisation

### API Endpoints

#### Récupérer les points de l'utilisateur

```bash
GET /gamification/points
Authorization: Bearer {token}

Response:
{
  "points": 12450,
  "level": "SILVER",
  "totalPointsEarned": 25000,
  "totalPointsRedeemed": 12550
}
```

#### Récupérer les statistiques complètes

```bash
GET /gamification/stats
Authorization: Bearer {token}

Response:
{
  "points": 12450,
  "level": "SILVER",
  "levelInfo": {
    "current": {
      "level": "SILVER",
      "cashbackRate": 0.01,
      "feeDiscount": 0.1
    },
    "next": {
      "level": "GOLD",
      "minPoints": 50000
    },
    "progress": {
      "current": 2450,
      "needed": 37550,
      "percentage": 6.125
    }
  },
  "totalEarned": 25000,
  "totalRedeemed": 12550,
  "currentStreak": 5,
  "longestStreak": 12
}
```

#### Historique des points

```bash
GET /gamification/points/history
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "points": 50,
    "action": "SEND_MONEY",
    "metadata": { "amount": 50000 },
    "balanceAfter": 12450,
    "createdAt": "2025-10-04T10:30:00Z"
  },
  ...
]
```

#### Échanger des points contre du cash

```bash
POST /gamification/points/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "points": 10000
}

Response:
{
  "cashAmount": 10000,
  "message": "10 000 XOF crédités sur votre compte"
}
```

#### Récupérer le code de parrainage

```bash
GET /gamification/referral/code
Authorization: Bearer {token}

Response:
{
  "code": "CROSSABCD12"
}
```

#### Mes parrainages

```bash
GET /gamification/referral/my-referrals
Authorization: Bearer {token}

Response:
{
  "totalReferrals": 3,
  "completedReferrals": 2,
  "pendingReferrals": 1,
  "totalPointsEarned": 10000,
  "referrals": [...]
}
```

---

## 🔌 Intégration

### Dans le service de paiement

Le système de points est automatiquement intégré dans le service de paiement. Après chaque transaction réussie :

```typescript
// Dans payments.service.ts
const response = await adapter.verify(request);

if (response.status === 'success') {
  // Attribution automatique des points
  const pointsResult = await this.pointsService.addPoints(
    request.userId,
    'SEND_MONEY',
    { amount: request.amount }
  );
  
  response.pointsEarned = pointsResult.points;
  response.levelUp = pointsResult.levelUp;
}
```

### Événements émis

Le système émet des événements pour permettre des actions automatiques :

- `points.added` : Quand des points sont ajoutés
- `level.up` : Quand un utilisateur change de niveau
- `referral.completed` : Quand un parrainage est complété
- `wallet.credit` : Quand des points sont échangés

Exemple d'écoute :

```typescript
@OnEvent('level.up')
handleLevelUp(payload: any) {
  // Envoyer notification push
  // Débloquer des fonctionnalités
  // Envoyer email de félicitations
}
```

---

## 📱 Utilisation Mobile

L'écran `RewardsScreen.tsx` est prêt à l'emploi :

```typescript
import RewardsScreen from './src/screens/RewardsScreen';

// Dans votre navigation
<Stack.Screen name="Rewards" component={RewardsScreen} />
```

---

## 🗄️ Migration Base de Données

Exécutez la migration SQL :

```bash
psql -U postgres -d crosspay -f migrations/001_create_gamification_tables.sql
```

Ou si vous utilisez TypeORM avec `synchronize: true`, les tables seront créées automatiquement.

---

## 🧪 Tests

```typescript
// Exemple de test
describe('PointsService', () => {
  it('should award points for transaction', async () => {
    const result = await pointsService.addPoints(
      'user123',
      'SEND_MONEY',
      { amount: 100000 }
    );
    
    expect(result.points).toBe(100); // 0.1% de 100000
    expect(result.newTotal).toBeGreaterThan(0);
  });
});
```

---

## 🎨 Personnalisation

### Modifier les règles de points

Éditez `POINT_RULES` dans `points.service.ts` :

```typescript
private readonly POINT_RULES = {
  SEND_MONEY: (amount: number) => Math.floor(amount * 0.002), // Changer à 0.2%
  NEW_ACTION: 100, // Ajouter une nouvelle action
};
```

### Modifier les niveaux

Éditez `LOYALTY_LEVELS` dans `points.service.ts` :

```typescript
private readonly LOYALTY_LEVELS = [
  { level: 'BRONZE', minPoints: 0, maxPoints: 5000, ... },
  // Ajoutez ou modifiez des niveaux
];
```

---

## 📊 Métriques & Analytics

Requêtes utiles pour le dashboard admin :

```sql
-- Utilisateurs par niveau
SELECT level, COUNT(*) as users
FROM user_points
GROUP BY level;

-- Points distribués aujourd'hui
SELECT SUM(points) as total_points
FROM point_transactions
WHERE created_at > CURRENT_DATE;

-- Top 10 utilisateurs
SELECT user_id, points, level
FROM user_points
ORDER BY points DESC
LIMIT 10;

-- Parrainages réussis ce mois
SELECT COUNT(*) as successful_referrals
FROM referrals
WHERE status = 'REWARDED'
AND completed_at > DATE_TRUNC('month', CURRENT_DATE);
```

---

## 🚦 Statut

✅ **Implémenté :**
- Système de points complet
- 5 niveaux de fidélité
- Programme de parrainage
- Échange de points
- Écran mobile Rewards
- Intégration avec paiements

🚧 **À venir :**
- Badges automatiques
- Challenges mensuels
- Leaderboards
- Notifications push pour events
- Analytics dashboard

---

## 📝 Notes

- Les points sont attribués **uniquement pour les transactions réussies**
- L'échange de points est **irréversible**
- Les niveaux sont calculés sur **total_points_earned**, pas sur le solde actuel
- Le parrainage est complété à la **première transaction du filleul**

---

## 🤝 Contribution

Pour ajouter de nouvelles fonctionnalités :

1. Créer une nouvelle entité si nécessaire
2. Ajouter les règles dans `PointsService`
3. Créer un endpoint dans `GamificationController`
4. Mettre à jour ce README
5. Ajouter des tests

---

## 📧 Support

Pour toute question : support@crosspay.africa

**🎉 Bon gamification !**
