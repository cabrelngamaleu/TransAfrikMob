import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface SmartSummary {
  pendingSuggestions: number;
  unreadInsights: number;
  topSuggestion: any;
  urgentInsights: any[];
}

interface Props {
  onPress: (suggestion: any) => void;
}

export default function AISuggestionsWidget({ onPress }: Props) {
  const [summary, setSummary] = useState<SmartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/summary`);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading AI summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2E86C1" />
      </View>
    );
  }

  if (!summary || (!summary.topSuggestion && summary.unreadInsights === 0)) {
    return null; // Ne rien afficher s'il n'y a pas de suggestions
  }

  return (
    <View style={styles.container}>
      {/* Top Suggestion */}
      {summary.topSuggestion && (
        <TouchableOpacity
          style={styles.suggestionCard}
          onPress={() => onPress(summary.topSuggestion)}
        >
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🤖</Text>
            <Text style={styles.headerText}>Suggestion IA</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {summary.topSuggestion.confidence}%
              </Text>
            </View>
          </View>

          <Text style={styles.suggestionText}>
            {summary.topSuggestion.reason}
          </Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Montant suggéré:</Text>
            <Text style={styles.amount}>
              {summary.topSuggestion.amount.toLocaleString()} {summary.topSuggestion.currency}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.actionText}>Envoyer maintenant</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Insights Counter */}
      {summary.unreadInsights > 0 && (
        <TouchableOpacity style={styles.insightsCounter}>
          <Text style={styles.insightsIcon}>📊</Text>
          <Text style={styles.insightsText}>
            {summary.unreadInsights} nouveau{summary.unreadInsights > 1 ? 'x' : ''} insight{summary.unreadInsights > 1 ? 's' : ''}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{summary.unreadInsights}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  suggestionCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86C1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E86C1',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  suggestionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 18,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  arrow: {
    fontSize: 18,
    color: '#27AE60',
  },
  insightsCounter: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightsText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#E74C3C',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
