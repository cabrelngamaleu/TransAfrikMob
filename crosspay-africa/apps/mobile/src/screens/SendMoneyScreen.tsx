import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface QuoteResponse {
  quoteId: string;
  recipientCountry: string;
  destinationCurrency: string;
  sourceAmount: number;
  destinationAmount: number;
  exchangeRate: number;
  totalFees: number;
  feeBreakdown: {
    fixedFee: number;
    percentageFee: number;
    aggregatorFee: number;
  };
  availableRails: Array<{
    id: string;
    name: string;
    estimatedDelivery: string;
    fee: number;
  }>;
  expiresIn: number;
}

export default function SendMoneyScreen() {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [selectedRail, setSelectedRail] = useState<string | null>(null);

  const getQuote = async () => {
    if (!recipientPhone || !amount) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone et un montant');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/payments/quote`, {
        recipientPhone,
        amount: parseFloat(amount),
        sourceCurrency: 'XOF' // Par défaut pour cet exemple
      });
      
      setQuote(response.data);
      if (response.data.availableRails.length > 0) {
        setSelectedRail(response.data.availableRails[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du devis:', error);
      Alert.alert('Erreur', 'Impossible d\'obtenir un devis pour ce transfert');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!quote || !selectedRail) {
      Alert.alert('Erreur', 'Veuillez d\'abord obtenir un devis');
      return;
    }

    try {
      // Vérifier l'authentification biométrique
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authentifiez-vous pour confirmer le paiement',
        fallbackLabel: 'Utiliser le code PIN'
      });

      if (authResult.success) {
        setLoading(true);
        // Envoyer la demande de paiement
        const response = await axios.post(`${API_URL}/payments/send`, {
          quoteId: quote.quoteId,
          railId: selectedRail,
          recipientPhone,
          amount: parseFloat(amount),
          sourceCurrency: 'XOF'
        });
        
        Alert.alert('Succès', 'Votre paiement a été initié avec succès!');
        // Réinitialiser le formulaire
        setRecipientPhone('');
        setAmount('');
        setQuote(null);
        setSelectedRail(null);
      } else {
        Alert.alert('Erreur', 'Authentification échouée. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du paiement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le paiement');
    } finally {
      setLoading(false);
    }
  };

  const renderQuoteDetails = () => {
    if (!quote) return null;

    return (
      <View style={styles.quoteContainer}>
        <Text style={styles.sectionTitle}>Détails du transfert</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pays destinataire:</Text>
          <Text style={styles.detailValue}>{quote.recipientCountry}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Montant envoyé:</Text>
          <Text style={styles.detailValue}>{quote.sourceAmount} XOF</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Montant reçu:</Text>
          <Text style={styles.detailValue}>{quote.destinationAmount} {quote.destinationCurrency}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Taux de change:</Text>
          <Text style={styles.detailValue}>1 XOF = {quote.exchangeRate} {quote.destinationCurrency}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Frais totaux:</Text>
          <Text style={styles.detailValue}>{quote.totalFees} XOF</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Méthodes d'envoi disponibles</Text>
        
        {quote.availableRails.map((rail) => (
          <TouchableOpacity
            key={rail.id}
            style={[
              styles.railOption,
              selectedRail === rail.id && styles.selectedRail
            ]}
            onPress={() => setSelectedRail(rail.id)}
          >
            <View style={styles.railInfo}>
              <Text style={styles.railName}>{rail.name}</Text>
              <Text style={styles.railDelivery}>Délai: {rail.estimatedDelivery}</Text>
            </View>
            <Text style={styles.railFee}>Frais: {rail.fee} XOF</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmer le paiement</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Envoyer de l'argent</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Numéro du destinataire</Text>
        <TextInput
          style={styles.input}
          placeholder="+254712345678"
          value={recipientPhone}
          onChangeText={setRecipientPhone}
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>Montant à envoyer (XOF)</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        
        <TouchableOpacity
          style={styles.quoteButton}
          onPress={getQuote}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.quoteButtonText}>Obtenir un devis</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {renderQuoteDetails()}
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  quoteButton: {
    backgroundColor: '#2E86C1',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
  },
  quoteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quoteContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  railOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  selectedRail: {
    borderColor: '#2E86C1',
    backgroundColor: 'rgba(46, 134, 193, 0.05)',
  },
  railInfo: {
    flex: 1,
  },
  railName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  railDelivery: {
    fontSize: 12,
    color: '#666',
  },
  railFee: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#27AE60',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});