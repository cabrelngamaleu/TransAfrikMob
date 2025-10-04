import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed';
  read: boolean;
  createdAt: string;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Vous devez être connecté pour voir vos notifications');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(response.data);
      setError('');
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err);
      setError('Impossible de charger les notifications. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour l'état local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour l'état local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour l'état local
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const formattedDate = format(new Date(item.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr });
    
    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              {item.type === 'email' && <Ionicons name="mail" size={20} color="#4A90E2" />}
              {item.type === 'sms' && <Ionicons name="chatbubble" size={20} color="#50C878" />}
              {item.type === 'push' && <Ionicons name="notifications" size={20} color="#FFA500" />}
            </View>
            <Text style={styles.notificationTitle}>{item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteNotification(item.id)}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.notificationContent}>{item.content}</Text>
        <Text style={styles.notificationDate}>{formattedDate}</Text>
        {!item.read && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off" size={50} color="#999" />
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  notificationContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;