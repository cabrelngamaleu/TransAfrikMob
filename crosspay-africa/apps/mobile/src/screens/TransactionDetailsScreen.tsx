import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Fonction pour obtenir la couleur en fonction du statut
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#4CAF50';
    case 'pending':
      return '#FF9800';
    case 'failed':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

// Fonction pour obtenir le texte du statut
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Complété';
    case 'pending':
      return 'En attente';
    case 'failed':
      return 'Échoué';
    default:
      return 'Inconnu';
  }
};

export default function TransactionDetailsScreen({ route, navigation }) {
  const { transaction } = route.params;

  // Fonction pour partager les détails de la transaction
  const shareTransaction = async () => {
    try {
      await Share.share({
        message: `Détails de la transaction CrossPay Africa:
ID: ${transaction.id}
Date: ${transaction.date}
Destinataire: ${transaction.recipient}
Montant: ${transaction.amount} ${transaction.currency}
Statut: ${getStatusText(transaction.status)}`,
        title: 'Détails de la transaction CrossPay Africa',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager les détails de la transaction');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la transaction</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareTransaction}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Montant envoyé</Text>
          <Text style={styles.amount}>{transaction.amount} {transaction.currency}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ID de transaction</Text>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{transaction.date}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Destinataire</Text>
            <Text style={styles.detailValue}>{transaction.recipient}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Méthode de paiement</Text>
            <Text style={styles.detailValue}>{transaction.paymentMethod || 'Mobile Money'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Frais</Text>
            <Text style={styles.detailValue}>{transaction.fee || '500'} {transaction.currency}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Référence</Text>
            <Text style={styles.detailValue}>{transaction.reference || 'REF-' + transaction.id}</Text>
          </View>
        </View>
      </View>

      {transaction.status === 'failed' && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#F44336" />
          <Text style={styles.errorText}>
            Cette transaction a échoué. Raison: {transaction.failureReason || 'Erreur de traitement'}
          </Text>
        </View>
      )}

      {transaction.status === 'pending' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Vérifier le statut</Text>
        </TouchableOpacity>
      )}

      {transaction.status === 'completed' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Télécharger le reçu</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.supportButton}>
        <Ionicons name="help-circle-outline" size={20} color="#0080ff" />
        <Text style={styles.supportButtonText}>Besoin d'aide avec cette transaction?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0080ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#0080ff',
    borderRadius: 8,
    margin: 16,
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  supportButtonText: {
    color: '#0080ff',
    marginLeft: 8,
    fontSize: 14,
  },
});