import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Operator {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  logoUrl: string;
  denominationType: string;
  fixedAmounts?: number[];
  minAmount?: number;
  maxAmount?: number;
}

export default function AirtimeScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState<Operator | null>(null);
  const [quickAmounts, setQuickAmounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [detectingOperator, setDetectingOperator] = useState(false);

  useEffect(() => {
    loadQuickAmounts();
  }, []);

  useEffect(() => {
    // Auto-detect operator when phone number is complete
    if (phoneNumber.length >= 9) {
      detectOperator();
    } else {
      setOperator(null);
    }
  }, [phoneNumber]);

  const loadQuickAmounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/airtime/quick-amounts`, {
        params: { currency: 'XOF' },
      });
      setQuickAmounts(response.data.amounts);
    } catch (error) {
      console.error('Error loading quick amounts:', error);
      // Fallback amounts
      setQuickAmounts([500, 1000, 2000, 5000, 10000]);
    }
  };

  const detectOperator = async () => {
    if (!phoneNumber || phoneNumber.length < 9) return;

    setDetectingOperator(true);
    try {
      const response = await axios.get(`${API_URL}/airtime/detect-operator`, {
        params: { phoneNumber },
      });
      setOperator(response.data);
    } catch (error) {
      console.error('Error detecting operator:', error);
      setOperator(null);
    } finally {
      setDetectingOperator(false);
    }
  };

  const handleBuy = async () => {
    if (!phoneNumber) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone');
      return;
    }

    if (!amount || parseFloat(amount) < 100) {
      Alert.alert('Erreur', 'Montant minimum : 100 XOF');
      return;
    }

    if (!operator) {
      Alert.alert('Erreur', 'Opérateur non détecté. Vérifiez le numéro.');
      return;
    }

    Alert.alert(
      'Confirmer l\'achat',
      `Acheter ${amount} XOF de crédit pour ${phoneNumber} (${operator.name}) ?\n\nVous gagnerez ${Math.floor(parseFloat(amount) * 0.002)} points ! 🎉`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: confirmPurchase },
      ]
    );
  };

  const confirmPurchase = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/airtime/buy`, {
        phoneNumber,
        amount: parseFloat(amount),
        currency: 'XOF',
      });

      Alert.alert(
        'Succès ! 🎉',
        `Crédit acheté avec succès !\n\n` +
        `Montant : ${response.data.transaction.amount} XOF\n` +
        `Opérateur : ${response.data.transaction.operator}\n` +
        `Points gagnés : ${response.data.transaction.pointsEarned} 💰`,
        [
          {
            text: 'OK',
            onPress: () => {
              setPhoneNumber('');
              setAmount('');
              setOperator(null);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error buying airtime:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible d\'acheter le crédit. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📱 Acheter du crédit</Text>
        <Text style={styles.subtitle}>Gagnez 0.2% en points sur chaque achat !</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Phone Number Input */}
        <Text style={styles.label}>Numéro de téléphone</Text>
        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.phoneInput}
            placeholder="+237695669921"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={15}
          />
          {detectingOperator && (
            <ActivityIndicator size="small" color="#2E86C1" style={styles.detectingIndicator} />
          )}
        </View>

        {/* Operator Detection Result */}
        {operator && (
          <View style={styles.operatorCard}>
            <View style={styles.operatorInfo}>
              {operator.logoUrl && (
                <Image
                  source={{ uri: operator.logoUrl }}
                  style={styles.operatorLogo}
                  resizeMode="contain"
                />
              )}
              <View style={styles.operatorTextContainer}>
                <Text style={styles.operatorName}>{operator.name}</Text>
                <Text style={styles.operatorCountry}>{operator.country}</Text>
              </View>
            </View>
            <Text style={styles.operatorBadge}>✓ Détecté</Text>
          </View>
        )}

        {/* Amount Input */}
        <Text style={styles.label}>Montant (XOF)</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Quick Amounts */}
        <Text style={styles.quickAmountsLabel}>Montants rapides</Text>
        <View style={styles.quickAmountsContainer}>
          {quickAmounts.map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={[
                styles.quickAmountButton,
                amount === quickAmount.toString() && styles.quickAmountButtonSelected,
              ]}
              onPress={() => setAmount(quickAmount.toString())}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  amount === quickAmount.toString() && styles.quickAmountTextSelected,
                ]}
              >
                {quickAmount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Points Preview */}
        {amount && parseFloat(amount) >= 100 && (
          <View style={styles.pointsPreview}>
            <Text style={styles.pointsIcon}>🎁</Text>
            <Text style={styles.pointsText}>
              Vous gagnerez <Text style={styles.pointsBold}>{Math.floor(parseFloat(amount) * 0.002)} points</Text> avec cet achat !
            </Text>
          </View>
        )}

        {/* Buy Button */}
        <TouchableOpacity
          style={[
            styles.buyButton,
            (!phoneNumber || !amount || !operator || loading) && styles.buyButtonDisabled,
          ]}
          onPress={handleBuy}
          disabled={!phoneNumber || !amount || !operator || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buyButtonText}>Acheter maintenant</Text>
              <Text style={styles.buyButtonSubtext}>Rapide et sécurisé</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Pourquoi utiliser CrossPay ?</Text>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>⚡</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Instantané</Text>
            <Text style={styles.featureDesc}>Crédit livré en quelques secondes</Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🎁</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Récompenses</Text>
            <Text style={styles.featureDesc}>0.2% en points sur chaque achat</Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Sécurisé</Text>
            <Text style={styles.featureDesc}>Transactions 100% sécurisées</Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🌍</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureName}>Multi-pays</Text>
            <Text style={styles.featureDesc}>Tous les opérateurs africains</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E86C1',
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  phoneInputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  detectingIndicator: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  operatorTextContainer: {
    flexDirection: 'column',
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  operatorCountry: {
    fontSize: 12,
    color: '#666',
  },
  operatorBadge: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickAmountButtonSelected: {
    backgroundColor: '#2E86C1',
    borderColor: '#2E86C1',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  quickAmountTextSelected: {
    color: '#fff',
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  pointsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  pointsText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
  },
  pointsBold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyButton: {
    backgroundColor: '#27AE60',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
});
