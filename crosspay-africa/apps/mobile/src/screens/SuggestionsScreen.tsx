import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Suggestion {
  id: string;
  type: string;
  recipient: {
    id: string;
    name: string;
    phone: string;
  };
  amount: number;
  currency: string;
  estimatedDate: Date;
  confidence: number;
  frequency: string;
  reason: string;
  lastTransactions: Array<{
    date: Date;
    amount: number;
  }>;
}

interface Insight {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  read: boolean;
  createdAt: Date;
  metadata?: any;
}

export default function SuggestionsScreen({ navigation }: any) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [suggestionsRes, insightsRes] = await Promise.all([
        axios.get(`${API_URL}/ai/suggestions`),
        axios.get(`${API_URL}/ai/insights`),
      ]);

      setSuggestions(suggestionsRes.data.suggestions || []);
      setInsights(insightsRes.data.insights || []);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    Alert.alert(
      'Envoyer de l\'argent ?',
      `${suggestion.reason}\n\nEnvoyer ${suggestion.amount} ${suggestion.currency} à ${suggestion.recipient.name} maintenant ?`,
      [
        { text: 'Pas maintenant', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: () => {
            // Naviguer vers l'écran d'envoi avec les données pré-remplies
            navigation.navigate('SendMoney', {
              recipientPhone: suggestion.recipient.phone,
              amount: suggestion.amount,
              recipientName: suggestion.recipient.name,
            });
          },
        },
      ]
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#27AE60';
    if (confidence >= 60) return '#F39C12';
    return '#95A5A6';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#E74C3C';
      case 'WARNING': return '#F39C12';
      default: return '#3498DB';
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY': return '📅 Chaque semaine';
      case 'BIWEEKLY': return '📅 Toutes les 2 semaines';
      case 'MONTHLY': return '📅 Chaque mois';
      default: return '📅 Régulièrement';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
        <Text style={styles.loadingText}>Analyse en cours...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Suggestions IA</Text>
        <Text style={styles.subtitle}>
          Basées sur votre historique de transactions
        </Text>
      </View>

      {/* AI Suggestions Section */}
      {suggestions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Suggestions de transferts</Text>
          
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionCard}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              {/* Header */}
              <View style={styles.suggestionHeader}>
                <View style={styles.recipientInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {suggestion.recipient.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.recipientName}>
                      {suggestion.recipient.name}
                    </Text>
                    <Text style={styles.recipientPhone}>
                      {suggestion.recipient.phone}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceColor(suggestion.confidence) },
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {suggestion.confidence}% sûr
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Montant suggéré</Text>
                <Text style={styles.amount}>
                  {suggestion.amount.toLocaleString()} {suggestion.currency}
                </Text>
              </View>

              {/* Frequency & Date */}
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>📅</Text>
                  <Text style={styles.metaText}>
                    {getFrequencyText(suggestion.frequency)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>📆</Text>
                  <Text style={styles.metaText}>
                    Estimé: {new Date(suggestion.estimatedDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>

              {/* Reason */}
              <Text style={styles.reason}>💬 {suggestion.reason}</Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.quickSendButton}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.quickSendText}>Envoyer maintenant →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>Aucune suggestion pour le moment</Text>
          <Text style={styles.emptyText}>
            L'IA apprend de vos habitudes. Effectuez plus de transactions pour recevoir des suggestions personnalisées.
          </Text>
        </View>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Insights sur vos finances</Text>
          
          {insights.slice(0, 5).map((insight) => (
            <View
              key={insight.id}
              style={[
                styles.insightCard,
                !insight.read && styles.insightUnread,
              ]}
            >
              <View style={styles.insightHeader}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(insight.priority) },
                  ]}
                />
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
              <Text style={styles.insightDate}>
                {new Date(insight.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* How it works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.howItWorksTitle}>Comment ça marche ?</Text>
        
        <View style={styles.howItWorksItem}>
          <Text style={styles.howItWorksIcon}>🧠</Text>
          <Text style={styles.howItWorksText}>
            L'IA analyse votre historique de transactions
          </Text>
        </View>

        <View style={styles.howItWorksItem}>
          <Text style={styles.howItWorksIcon}>📊</Text>
          <Text style={styles.howItWorksText}>
            Détecte les patterns et habitudes récurrentes
          </Text>
        </View>

        <View style={styles.howItWorksItem}>
          <Text style={styles.howItWorksIcon}>💡</Text>
          <Text style={styles.howItWorksText}>
            Vous suggère les transactions au bon moment
          </Text>
        </View>

        <View style={styles.howItWorksItem}>
          <Text style={styles.howItWorksIcon}>🎯</Text>
          <Text style={styles.howItWorksText}>
            Vous aide à économiser et mieux gérer votre argent
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86C1',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E86C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recipientPhone: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  metaInfo: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  reason: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  quickSendButton: {
    backgroundColor: '#27AE60',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickSendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySection: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  insightCard: {
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
  insightUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightDate: {
    fontSize: 12,
    color: '#999',
  },
  howItWorksSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  howItWorksIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  howItWorksText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
});
