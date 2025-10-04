import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import TransactionDetailsScreen from './src/screens/TransactionDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigateur principal avec les onglets
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'SendMoneyTab') {
            iconName = focused ? 'send' : 'send-outline';
          } else if (route.name === 'TransactionsTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0080ff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="SendMoneyTab" 
        component={SendMoneyScreen} 
        options={{ title: 'Envoyer' }}
      />
      <Tab.Screen 
        name="TransactionsTab" 
        component={TransactionHistoryScreen} 
        options={{ title: 'Transactions' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TransactionDetails" 
          component={TransactionDetailsScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}