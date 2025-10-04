import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Types pour les transactions
type Transaction = {
  id: string;
  date: string;
  recipient: string;
  amount: string;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
};

// Données simulées pour les transactions
const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    date: '2023-07-15',
    recipient: '+2348000000000',
    amount: '100.00',
    currency: 'GHS',
    status: 'completed',
  },
  {
    id: 'tx-002',
    date: '2023-07-14',
    recipient: '+256700000000',
    amount: '1000.00',
    currency: 'KES',
    status: 'completed',
  },
  {
    id: 'tx-003',
    date: '2023-07-13',
    recipient: '+2348000000001',
    amount: '200.00',
    currency: 'GHS',
    status: 'pending',
  },
  {
    id: 'tx-004',
    date: '2023-07-12',
    recipient: '+256700000001',
    amount: '500.00',
    currency: 'KES',
    status: 'failed',
  },
];

export default function TransactionHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour charger les transactions depuis l'API
  const loadTransactions = async () => {
    // Dans une implémentation réelle, nous ferions un appel API ici
    // setLoading(true);
    // try {
    //   const response = await axios.get(`${API_URL}/transactions`);
    //   setTransactions(response.data);
    // } catch (error) {
    //   console.error('Erreur lors du chargement des transactions:', error);
    // } finally {
    //   setLoading(false);
    // }

    // Pour l'instant, nous utilisons les données simulées
    setLoading(true);
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  };

  // Fonction pour rafraîchir les transactions
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Fonction pour afficher la couleur en fonction du statut
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50'; // Vert
      case 'pending':
        return '#FFC107'; // Jaune
      case 'failed':
        return '#F44336'; // Rouge
      default:
        return '#757575'; // Gris
    }
  };

  // Fonction pour afficher le texte du statut en français
  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En cours';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  };

  // Rendu d'un élément de transaction
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
    >
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionId}>ID: {item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.recipient}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.amountText}>{item.amount} {item.currency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des transactions</Text>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080ff" />
          <Text style={styles.loadingText}>Chargement des transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0080ff']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});