import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface PointStats {
  points: number;
  level: string;
  levelInfo: {
    current: {
      level: string;
      cashbackRate: number;
      feeDiscount: number;
    };
    next: {
      level: string;
      minPoints: number;
    } | null;
    progress: {
      current: number;
      needed: number;
      percentage: number;
    } | null;
  };
  totalEarned: number;
  totalRedeemed: number;
  currentStreak: number;
}

export default function RewardsScreen() {
  const [stats, setStats] = useState<PointStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/gamification/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleRedeem = async () => {
    if (!stats || stats.points < 1000) {
      alert('Vous devez avoir au moins 1000 points pour échanger');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/gamification/points/redeem`, {
        points: Math.min(stats.points, 10000), // Maximum 10 000 points par transaction
      });

      alert(`Succès ! ${response.data.cashAmount} XOF crédités sur votre compte ! 🎉`);
      loadStats(); // Recharger les stats
    } catch (error) {
      alert('Erreur lors de l\'échange de points');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>Erreur de chargement</Text>
      </View>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BRONZE': return '#CD7F32';
      case 'SILVER': return '#C0C0C0';
      case 'GOLD': return '#FFD700';
      case 'PLATINUM': return '#E5E4E2';
      case 'DIAMOND': return '#B9F2FF';
      default: return '#CD7F32';
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'BRONZE': return '🥉';
      case 'SILVER': return '🥈';
      case 'GOLD': return '🥇';
      case 'PLATINUM': return '💎';
      case 'DIAMOND': return '👑';
      default: return '🥉';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Points Balance Card */}
      <View style={[styles.balanceCard, { backgroundColor: getLevelColor(stats.level) }]}>
        <Text style={styles.balanceLabel}>Vos Points</Text>
        <Text style={styles.balanceAmount}>{stats.points.toLocaleString()}</Text>
        <Text style={styles.balanceValue}>= {stats.points.toLocaleString()} XOF</Text>
        <Text style={styles.levelBadge}>
          {getLevelEmoji(stats.level)} {stats.level}
        </Text>
      </View>

      {/* Level Progress Card */}
      {stats.levelInfo.next && stats.levelInfo.progress && (
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={[styles.currentLevelText, { color: getLevelColor(stats.level) }]}>
              {getLevelEmoji(stats.level)} {stats.level}
            </Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={[styles.nextLevelText, { color: getLevelColor(stats.levelInfo.next.level) }]}>
              {getLevelEmoji(stats.levelInfo.next.level)} {stats.levelInfo.next.level}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${Math.min(stats.levelInfo.progress.percentage, 100)}%`,
                  backgroundColor: getLevelColor(stats.level),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Plus que {stats.levelInfo.progress.needed.toLocaleString()} points pour {stats.levelInfo.next.level} !
          </Text>
          <View style={styles.benefitsRow}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitLabel}>Cashback</Text>
              <Text style={styles.benefitValue}>
                {(stats.levelInfo.current.cashbackRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitLabel}>Réduction frais</Text>
              <Text style={styles.benefitValue}>
                {(stats.levelInfo.current.feeDiscount * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Ways to Earn Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Gagnez des points</Text>

        <View style={styles.actionCard}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionEmoji}>👥</Text>
            <View>
              <Text style={styles.actionTitle}>Parrainez un ami</Text>
              <Text style={styles.actionSubtitle}>Vous et votre ami gagnez</Text>
            </View>
          </View>
          <Text style={styles.actionReward}>+5000 pts</Text>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionEmoji}>💸</Text>
            <View>
              <Text style={styles.actionTitle}>Envoyez de l'argent</Text>
              <Text style={styles.actionSubtitle}>0.1% du montant</Text>
            </View>
          </View>
          <Text style={styles.actionReward}>+0.1%</Text>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionEmoji}>📅</Text>
            <View>
              <Text style={styles.actionTitle}>Connexion quotidienne</Text>
              <Text style={styles.actionSubtitle}>Chaque jour</Text>
            </View>
          </View>
          <Text style={styles.actionReward}>+10 pts</Text>
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionEmoji}>✅</Text>
            <View>
              <Text style={styles.actionTitle}>Vérification KYC</Text>
              <Text style={styles.actionSubtitle}>Une seule fois</Text>
            </View>
          </View>
          <Text style={styles.actionReward}>+2000 pts</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalEarned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points gagnés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRedeemed.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points échangés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak actuel</Text>
          </View>
        </View>
      </View>

      {/* Redeem Button */}
      <TouchableOpacity
        style={[
          styles.redeemButton,
          stats.points < 1000 && styles.redeemButtonDisabled,
        ]}
        onPress={handleRedeem}
        disabled={stats.points < 1000}
      >
        <Text style={styles.redeemButtonText}>
          {stats.points < 1000
            ? 'Minimum 1000 points requis'
            : 'Échanger contre du cash 💰'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          1 point = 1 XOF
        </Text>
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
  },
  balanceCard: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currentLevelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 16,
    color: '#999',
  },
  nextLevelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  benefitItem: {
    alignItems: 'center',
  },
  benefitLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  benefitValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionReward: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  redeemButton: {
    backgroundColor: '#27AE60',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redeemButtonDisabled: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});
