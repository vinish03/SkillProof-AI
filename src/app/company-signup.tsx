import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const API_URL = 'http://192.168.1.3:5000';

export default function CompanySignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert(
        'Missing Information',
        'Company name, email and password are required'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Error',
        'Passwords do not match'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/company/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            industry,
            companySize,
          }),
        }
      );

      const data = await response.json();

      console.log('COMPANY SIGNUP STATUS:', response.status);
      console.log('COMPANY SIGNUP RESPONSE:', data);

      if (!response.ok) {
        Alert.alert(
          'Signup Failed',
          data.message || 'Something went wrong'
        );
        return;
      }

      await AsyncStorage.setItem(
        'companyId',
        data.company.id
      );

      await AsyncStorage.setItem(
        'companyName',
        data.company.name
      );

      Alert.alert(
        'Success',
        'Company account created successfully',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/company-dashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Company signup error:', error);

      Alert.alert(
        'Error',
        'Unable to connect to the server'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Create Company Account
      </Text>

      <Text style={styles.subtitle}>
        Start hiring with SkillProof AI
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={name}
        onChangeText={setName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Industry"
        value={industry}
        onChangeText={setIndustry}
      />

      <TextInput
        style={styles.input}
        placeholder="Company Size (e.g. 10-50 employees)"
        value={companySize}
        onChangeText={setCompanySize}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Creating Account...'
            : 'Create Company Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/company-login')}
      >
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
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

  loginText: {
    textAlign: 'center',
    marginTop: 25,
    color: '#5b4ee8',
  },
});

