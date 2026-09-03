import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CompanyDashboard() {
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    const name = await AsyncStorage.getItem('companyName');

    if (name) {
      setCompanyName(name);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('companyId');
    await AsyncStorage.removeItem('companyName');

    Alert.alert('Logged Out', 'You have been logged out.');

    router.replace('/company-login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Company Dashboard
      </Text>

      <Text style={styles.welcome}>
        Welcome, {companyName || 'Company'}
      </Text>

      <Text style={styles.subtitle}>
        Manage your jobs, assessments and applications
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/company-jobs')}
      >
        <Text style={styles.buttonText}>
          Manage Jobs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/company-manage-assessments')}
      >
        <Text style={styles.buttonText}>
          Manage Assessments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/company-applications')}
      >
        <Text style={styles.buttonText}>
          View Applications
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  welcome: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },

  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 35,
  },

  button: {
    backgroundColor: '#5b4ee8',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },

  logoutButton: {
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});