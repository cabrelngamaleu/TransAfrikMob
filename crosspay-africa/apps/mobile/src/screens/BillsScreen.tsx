import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const BILL_TYPES = [
  { id: 'ELECTRICITY', name: 'Électricité', icon: '⚡', color: '#F39C12' },
  { id: 'WATER', name: 'Eau', icon: '💧', color: '#3498DB' },
  { id: 'INTERNET', name: 'Internet', icon: '🌐', color: '#9B59B6' },
  { id: 'TV', name: 'Télévision', icon: '📺', color: '#E74C3C' },
];

export default function BillsScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [accountValidation, setAccountValidation] = useState<any>(null);
  const [quickAmounts, setQuickAmounts] = useState<number[]>([]);
  const [recurringBills, setRecurringBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadRecurringBills();
  }, []);

  useEffect(() => {
    if (selectedType) {
      loadProviders();
      loadQuickAmounts();
    }
  }, [selectedType]);

  const loadProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/bills/providers`, {
        params: { billType: selectedType },
      });
      setProviders(response.data.providers || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadQuickAmounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/bills/quick-amounts/${selectedType}`);
      setQuickAmounts(response.data.amounts || []);
    } catch (error) {
      console.error('Error loading quick amounts:', error);
    }
  };

  const loadRecurringBills = async () => {
    try {
      const response = await axios.get(`${API_URL}/bills/recurring`);
      setRecurringBills(response.data.bills || []);
    } catch (error) {
      console.error('Error loading recurring bills:', error);
    }
  };

  const validateAccount = async () => {
    if (!selectedProvider || !accountNumber) return;

    setValidating(true);
    try {
      const response = await axios.post(`${API_URL}/bills/validate`, {
        providerId: selectedProvider.id,
        accountNumber,
      });
      setAccountValidation(response.data);
    } catch (error) {
      console.error('Error validating account:', error);
      Alert.alert('Erreur', 'Impossible de valider le numéro de compte');
    } finally {
      setValidating(false);
    }
  };

  const handlePayBill = async () => {
    if (!selectedProvider || !accountNumber || !amount) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 100) {
      Alert.alert('Erreur', 'Montant invalide (minimum 100 XOF)');
      return;
    }

    Alert.alert(
      'Confirmer le paiement',
      `Payer ${amountNum.toLocaleString()} XOF à ${selectedProvider.name} pour le compte ${accountNumber} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => processPayment(amountNum) },
      ]
    );
  };

  const processPayment = async (amountNum: number) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/bills/pay`, {
        billType: selectedType,
        providerId: selectedProvider.id,
        accountNumber,
        amount: amountNum,
        currency: 'XOF',
      });

      Alert.alert(
        'Succès ! 🎉',
        `Facture payée avec succès !\n\nTransac ID: ${response.data.transaction.externalTransactionId}\n\n✨ Points gagnés !`,
        [{ text: 'OK', onPress: resetForm }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Le paiement a échoué');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setSelectedProvider(null);
    setAccountNumber('');
    setAmount('');
    setAccountValidation(null);
  };

  const handleRecurringBillPress = (bill: any) => {
    setSelectedType(bill.billType);
    setTimeout(() => {
      const provider = providers.find(p => p.id === bill.providerId);
      if (provider) {
        setSelectedProvider(provider);
        setAccountNumber(bill.accountNumber);
        setAmount(bill.avgAmount.toString());
      }
    }, 100);
  };

  const pointsToEarn = amount ? Math.floor(parseFloat(amount) * 0.0015) : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💡 Payer vos factures</Text>
        <Text style={styles.subtitle}>Électricité, Eau, Internet, TV...</Text>
      </View>

      {/* Recurring Bills Suggestions */}
      {recurringBills.length > 0 && !selectedType && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Factures à payer</Text>
          {recurringBills.map((bill, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recurringCard}
              onPress={() => handleRecurringBillPress(bill)}
            >
              <View style={styles.recurringHeader}>
                <Text style={styles.recurringIcon}>
                  {BILL_TYPES.find(t => t.id === bill.billType)?.icon}
                </Text>
                <View style={styles.recurringInfo}>
                  <Text style={styles.recurringProvider}>{bill.providerName}</Text>
                  <Text style={styles.recurringAccount}>Compte: {bill.accountNumber}</Text>
                </View>
                <Text style={styles.recurringAmount}>
                  {bill.avgAmount.toLocaleString()} XOF
                </Text>
              </View>
              <Text style={styles.recurringNote}>
                💡 Dernier paiement: il y a {bill.daysSinceLastPayment} jours
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bill Type Selection */}
      {!selectedType && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de facture</Text>
          <View style={styles.typeGrid}>
            {BILL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, { borderColor: type.color }]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeName}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Provider Selection */}
      {selectedType && !selectedProvider && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedType(null)}>
            <Text>← Retour</Text>
          </TouchableOpacity>
          
          <Text style={styles.sectionTitle}>Choisir le fournisseur</Text>
          {providers.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => setSelectedProvider(provider)}
            >
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerCountry}>📍 {provider.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Payment Form */}
      {selectedProvider && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedProvider(null)}>
            <Text>← Changer fournisseur</Text>
          </TouchableOpacity>

          <View style={styles.selectedProvider}>
            <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de compte / Contrat</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Ex: 123456789"
                keyboardType="numeric"
                onBlur={validateAccount}
              />
              {validating && <ActivityIndicator size="small" color="#2E86C1" />}
            </View>
            {accountValidation?.valid && (
              <View style={styles.validationSuccess}>
                <Text style={styles.validationText}>
                  ✅ {accountValidation.customerName}
                </Text>
                {accountValidation.balance && (
                  <Text style={styles.balanceText}>
                    Solde: {accountValidation.balance.toLocaleString()} XOF
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Quick Amounts */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Montants rapides</Text>
            <View style={styles.quickAmountsRow}>
              {quickAmounts.map((qa) => (
                <TouchableOpacity
                  key={qa}
                  style={[
                    styles.quickAmountButton,
                    amount === qa.toString() && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => setAmount(qa.toString())}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === qa.toString() && styles.quickAmountTextActive,
                    ]}
                  >
                    {(qa / 1000).toFixed(0)}K
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ou saisir un montant</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Montant en XOF"
              keyboardType="numeric"
            />
          </View>

          {/* Points Preview */}
          {pointsToEarn > 0 && (
            <View style={styles.pointsPreview}>
              <Text style={styles.pointsIcon}>🎁</Text>
              <Text style={styles.pointsText}>
                Vous gagnerez {pointsToEarn} points avec ce paiement !
              </Text>
            </View>
          )}

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayBill}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                Payer {amount ? `${parseFloat(amount).toLocaleString()} XOF` : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Benefits */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Pourquoi payer avec CrossPay ?</Text>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>⚡</Text>
          <Text style={styles.benefitText}>Paiement instantané</Text>
        </View>

        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🎁</Text>
          <Text style={styles.benefitText}>Gagnez des points (0.15%)</Text>
        </View>

        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🔔</Text>
          <Text style={styles.benefitText}>Rappels automatiques</Text>
        </View>

        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>📊</Text>
          <Text style={styles.benefitText}>Historique complet</Text>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  recurringCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recurringIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  recurringInfo: {
    flex: 1,
  },
  recurringProvider: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recurringAccount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recurringAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F39C12',
  },
  recurringNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  providerCountry: {
    fontSize: 14,
    color: '#666',
  },
  selectedProvider: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedProviderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  validationSuccess: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
  },
  validationText: {
    fontSize: 14,
    color: '#155724',
    fontWeight: '600',
  },
  balanceText: {
    fontSize: 12,
    color: '#155724',
    marginTop: 4,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '18%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  quickAmountButtonActive: {
    backgroundColor: '#2E86C1',
    borderColor: '#2E86C1',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  quickAmountTextActive: {
    color: '#fff',
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  pointsIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 14,
    color: '#2E7D32',
    flex: 1,
  },
  payButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
  },
});
