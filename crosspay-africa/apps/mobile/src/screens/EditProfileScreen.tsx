import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ route, navigation }) {
  const { user } = route.params;
  
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    country: user.country,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fonction pour mettre à jour les champs du formulaire
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Fonction pour valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Format de téléphone invalide';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Le pays est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = () => {
    if (validateForm()) {
      setLoading(true);
      
      // Simuler une requête API
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          "Succès",
          "Votre profil a été mis à jour avec succès",
          [
            { 
              text: "OK", 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }, 1500);
    }
  };

  // Fonction pour annuler les modifications
  const handleCancel = () => {
    Alert.alert(
      "Annuler les modifications",
      "Êtes-vous sûr de vouloir annuler les modifications ?",
      [
        {
          text: "Non",
          style: "cancel"
        },
        { 
          text: "Oui", 
          onPress: () => navigation.goBack() 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0080ff" />
        <Text style={styles.loadingText}>Mise à jour en cours...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              placeholder="Entrez votre prénom"
              placeholderTextColor="#999"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              placeholder="Entrez votre nom"
              placeholderTextColor="#999"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Entrez votre email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              placeholder="Entrez votre numéro de téléphone"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pays</Text>
            <TextInput
              style={[styles.input, errors.country ? styles.inputError : null]}
              value={formData.country}
              onChangeText={(text) => handleChange('country', text)}
              placeholder="Entrez votre pays"
              placeholderTextColor="#999"
            />
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0080ff',
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});