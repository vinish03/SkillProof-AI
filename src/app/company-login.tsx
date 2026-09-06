import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://skillproof-ai-b0ax.onrender.com';

export default function CompanyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      if (typeof window !== 'undefined') {
        window.alert('Please enter email and password');
      } else {
        Alert.alert('Error', 'Please enter email and password');
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/company/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log('COMPANY LOGIN STATUS:', response.status);
      console.log('COMPANY LOGIN RESPONSE:', data);

      if (!response.ok) {
        if (typeof window !== 'undefined') {
          window.alert(data.message || 'Invalid login details');
        } else {
          Alert.alert(
            'Login Failed',
            data.message || 'Invalid login details'
          );
        }
        return;
      }

      console.log('COMPANY LOGIN DATA:', data);

      await AsyncStorage.setItem(
        'companyId',
        data.company._id
      );

      await AsyncStorage.setItem(
        'companyName',
        data.company.name
      );

      console.log(
        'COMPANY NAME SAVED:',
        data.company.name
      );

      if (typeof window !== 'undefined') {
        window.alert('Company login successful');
        router.replace('/company-dashboard');
      } else {
        Alert.alert(
          'Success',
          'Company login successful',
          [
            {
              text: 'OK',
              onPress: () =>
                router.replace('/company-dashboard'),
            },
          ]
        );
      }

    } catch (error) {
      console.error(
        'Company login error:',
        error
      );

      if (typeof window !== 'undefined') {
        window.alert('Cannot connect to server');
      } else {
        Alert.alert(
          'Error',
          'Cannot connect to server'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Company Login
      </Text>

      <Text style={styles.subtitle}>
        Login to manage jobs and assessments
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Company Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push('/company-signup')
        }
      >
        <Text style={styles.signup}>
          Don't have a company account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 35,
    color: '#666666',
  },

  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#5b4ee8',
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

  signup: {
    textAlign: 'center',
    marginTop: 25,
    color: '#5b4ee8',
  },
});