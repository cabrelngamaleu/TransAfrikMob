# 📱 Module Airtime - CrossPay Africa

## 📋 Vue d'ensemble

Le module Airtime permet aux utilisateurs d'acheter du crédit téléphonique pour n'importe quel opérateur africain directement depuis l'application. Les achats sont récompensés avec des points bonus (0.2% du montant).

### Fonctionnalités principales

- ✅ Achat de crédit pour tous les opérateurs africains
- ✅ Détection automatique de l'opérateur
- ✅ Livraison instantanée (< 30 secondes)
- ✅ Points bonus (0.2% du montant)
- ✅ Historique des transactions
- ✅ Statistiques et insights
- ✅ Montants rapides pré-configurés

---

## 🏗️ Architecture

### Intégration Reloadly

Le module utilise l'API Reloadly pour l'achat d'airtime :
- **API URL** : `https://topups.reloadly.com`
- **Auth URL** : `https://auth.reloadly.com/oauth/token`
- **Documentation** : https://docs.reloadly.com

### Entités

#### AirtimeTransaction
Stocke l'historique de tous les achats d'airtime.

```typescript
{
  id: string;
  userId: string;
  phoneNumber: string;
  amount: number;
  currency: string; // XOF, NGN, GHS, etc.
  operatorId: string;
  operatorName: string;
  countryCode: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  externalTransactionId?: string; // ID Reloadly
  pointsEarned: number;
  metadata?: any;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Operator
Cache local des opérateurs disponibles.

```typescript
{
  id: string;
  externalId: string; // ID Reloadly
  name: string;
  countryCode: string;
  countryName: string;
  denominations?: any; // Fixed amounts ou min/max
  commission: number;
  isActive: boolean;
  logoUrl?: string;
  createdAt: Date;
}
```

---

## 🚀 Utilisation

### Configuration

1. **Variables d'environnement** (`.env`)

```bash
# Reloadly API Configuration
RELOADLY_CLIENT_ID=your_client_id
RELOADLY_CLIENT_SECRET=your_client_secret
RELOADLY_API_URL=https://topups.reloadly.com
RELOADLY_AUTH_URL=https://auth.reloadly.com/oauth/token
```

2. **Créer un compte Reloadly**
   - Aller sur https://www.reloadly.com
   - S'inscrire en mode sandbox pour les tests
   - Récupérer Client ID et Client Secret
   - En production, passer en mode live

### API Endpoints

#### 1. Acheter du crédit

```bash
POST /airtime/buy
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumber": "+237695669921",
  "amount": 1000,
  "currency": "XOF"
}

Response:
{
  "success": true,
  "message": "Crédit acheté avec succès !",
  "transaction": {
    "id": "uuid",
    "amount": 1000,
    "currency": "XOF",
    "phoneNumber": "+237695669921",
    "operator": "MTN Cameroon",
    "pointsEarned": 2,
    "status": "SUCCESS",
    "createdAt": "2025-10-04T10:30:00Z"
  }
}
```

#### 2. Détecter l'opérateur

```bash
GET /airtime/detect-operator?phoneNumber=+237695669921
Authorization: Bearer {token}

Response:
{
  "id": 341,
  "name": "MTN Cameroon",
  "country": "Cameroun",
  "countryCode": "CM",
  "logoUrl": "https://logo.reloadly.com/mtn-cameroon.png",
  "denominationType": "RANGE",
  "minAmount": 100,
  "maxAmount": 100000
}
```

#### 3. Historique des achats

```bash
GET /airtime/history
Authorization: Bearer {token}

Response:
{
  "transactions": [
    {
      "id": "uuid",
      "phoneNumber": "+237695669921",
      "amount": 1000,
      "currency": "XOF",
      "operator": "MTN Cameroon",
      "status": "SUCCESS",
      "pointsEarned": 2,
      "createdAt": "2025-10-04T10:30:00Z"
    },
    ...
  ]
}
```

#### 4. Statistiques

```bash
GET /airtime/stats
Authorization: Bearer {token}

Response:
{
  "totalTransactions": 15,
  "totalAmount": 25000,
  "totalPointsEarned": 50,
  "successRate": 93.33
}
```

#### 5. Montants rapides

```bash
GET /airtime/quick-amounts?currency=XOF
Authorization: Bearer {token}

Response:
{
  "amounts": [500, 1000, 2000, 5000, 10000]
}
```

---

## 📱 Utilisation Mobile

L'écran `AirtimeScreen.tsx` est prêt à l'emploi :

```typescript
import AirtimeScreen from './src/screens/AirtimeScreen';

// Dans votre navigation
<Stack.Screen name="Airtime" component={AirtimeScreen} />
```

### Features de l'écran mobile

- ✅ Saisie du numéro de téléphone
- ✅ Détection automatique de l'opérateur (avec logo)
- ✅ Saisie du montant
- ✅ Boutons de montants rapides (500, 1000, 2000, 5000, 10000)
- ✅ Prévisualisation des points à gagner
- ✅ Confirmation avant achat
- ✅ Feedback visuel (loading, success, error)

---

## 🎁 Système de Points

### Calcul des points

Les points sont calculés à **0.2%** du montant acheté :

```typescript
points = Math.floor(amount * 0.002);
```

**Exemples :**
- 1000 XOF → 2 points
- 5000 XOF → 10 points
- 10000 XOF → 20 points

### Attribution automatique

Les points sont attribués automatiquement après un achat réussi dans `AirtimeService` :

```typescript
const pointsResult = await this.pointsService.addPoints(
  userId,
  'BUY_AIRTIME',
  { amount: dto.amount }
);
```

---

## 🗄️ Migration Base de Données

Exécutez la migration SQL :

```bash
psql -U postgres -d crosspay -f migrations/002_create_airtime_tables.sql
```

Ou avec TypeORM (`synchronize: true`), les tables seront créées automatiquement.

### Tables créées

1. `airtime_transactions` - Historique des achats
2. `operators` - Cache des opérateurs
3. Vues :
   - `airtime_stats_by_user` - Stats par utilisateur
   - `airtime_stats_by_operator` - Stats par opérateur

---

## 🔧 Opérateurs Supportés

### Pays couverts

- 🇨🇲 **Cameroun** : MTN, Orange, Camtel
- 🇳🇬 **Nigeria** : MTN, Airtel, Glo, 9mobile
- 🇬🇭 **Ghana** : MTN, Vodafone, AirtelTigo
- 🇰🇪 **Kenya** : Safaricom, Airtel
- 🇨🇮 **Côte d'Ivoire** : MTN, Orange, Moov
- 🇸🇳 **Sénégal** : Orange, Free, Expresso
- 🇺🇬 **Ouganda** : MTN, Airtel
- 🇹🇿 **Tanzanie** : Vodacom, Airtel, Tigo

Et **100+ autres pays** !

### Détection automatique

Le système détecte l'opérateur automatiquement basé sur le préfixe du numéro :

```typescript
// Exemples de préfixes
Cameroun: +237 65X, 67X, 68X → MTN
          +237 69X → Orange
Nigeria:  +234 803, +234 806 → MTN
          +234 802, +234 808 → Airtel
Ghana:    +233 24X, +233 54X → MTN
          +233 20X, +233 50X → Vodafone
```

---

## 💰 Revenus & Commissions

### Modèle économique

1. **Markup sur le prix** : 2-3% sur chaque vente
2. **Volume bonus** : Commissions Reloadly croissantes
3. **Cross-selling** : Attirer des utilisateurs qui font ensuite des transferts

### Exemple de calcul

```
Utilisateur achète : 10 000 XOF
Commission Reloadly : 2% = 200 XOF
Revenue CrossPay : 200 XOF
Points utilisateur : 20 points (0.2% du montant)
Coût points : 20 XOF (si échangés)
Profit net : 180 XOF
```

---

## 📊 Analytics & Reporting

### Requêtes SQL utiles

```sql
-- Total des ventes aujourd'hui
SELECT 
  COUNT(*) as transactions,
  SUM(amount) as total_amount,
  SUM(points_earned) as points_distributed
FROM airtime_transactions
WHERE created_at > CURRENT_DATE
AND status = 'SUCCESS';

-- Top 10 utilisateurs
SELECT 
  user_id,
  COUNT(*) as purchases,
  SUM(amount) as total_spent,
  SUM(points_earned) as total_points
FROM airtime_transactions
WHERE status = 'SUCCESS'
GROUP BY user_id
ORDER BY total_spent DESC
LIMIT 10;

-- Taux de succès par opérateur
SELECT 
  operator_name,
  country_code,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'SUCCESS') as success,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'SUCCESS')::DECIMAL / COUNT(*) * 100,
    2
  ) as success_rate
FROM airtime_transactions
GROUP BY operator_name, country_code
ORDER BY total DESC;
```

---

## 🧪 Tests

### Test manuel (Postman/cURL)

```bash
# 1. Détecter opérateur
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/airtime/detect-operator?phoneNumber=+237695669921"

# 2. Acheter crédit
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+237695669921","amount":1000,"currency":"XOF"}' \
  http://localhost:3000/airtime/buy

# 3. Historique
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/airtime/history
```

### Tests unitaires

```typescript
describe('AirtimeService', () => {
  it('should purchase airtime successfully', async () => {
    const result = await airtimeService.buyAirtime('user123', {
      phoneNumber: '+237695669921',
      amount: 1000,
      currency: 'XOF',
    });
    
    expect(result.status).toBe('SUCCESS');
    expect(result.pointsEarned).toBe(2);
  });
  
  it('should detect operator correctly', async () => {
    const operator = await airtimeService.detectOperator('+237695669921');
    expect(operator.name).toBe('MTN Cameroon');
  });
});
```

---

## 🚨 Gestion des Erreurs

### Erreurs communes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Operator not found` | Numéro invalide | Vérifier le format |
| `Insufficient balance` | Solde Reloadly insuffisant | Recharger le compte |
| `Invalid amount` | Montant hors limites | Vérifier min/max |
| `Authentication failed` | Token expiré | Régénérer le token |

### Retry Logic

En cas d'échec temporaire, le système ne retry PAS automatiquement. L'utilisateur doit réessayer manuellement.

---

## 🔐 Sécurité

### Best Practices

1. ✅ Authentification JWT requise
2. ✅ Validation des montants (min 100, max 100 000)
3. ✅ Validation du format du numéro
4. ✅ Rate limiting (à implémenter)
5. ✅ Logs détaillés de toutes les transactions
6. ✅ Tokens Reloadly stockés en mémoire seulement

### Rate Limiting (recommandé)

```typescript
// À ajouter dans airtime.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10, // 10 achats par minute max
}),
```

---

## 📈 Roadmap Future

- [ ] Support de recharge de bundles data
- [ ] Recharge récurrente automatique
- [ ] Favoris (numéros fréquents)
- [ ] Promotions et offres spéciales
- [ ] Achats groupés (plusieurs numéros)
- [ ] API B2B pour entreprises
- [ ] Widget de recharge sur sites partenaires

---

## 🆘 Support

### Problèmes courants

**Q: La détection d'opérateur ne fonctionne pas**
A: Vérifiez le format du numéro (doit inclure le code pays avec +)

**Q: L'achat échoue toujours**
A: Vérifiez vos credentials Reloadly et le solde du compte

**Q: Les points ne sont pas attribués**
A: Vérifiez que le GamificationModule est bien importé

### Contacts

- Documentation Reloadly : https://docs.reloadly.com
- Support CrossPay : support@crosspay.africa

---

**🎉 Module Airtime prêt à l'emploi !**
