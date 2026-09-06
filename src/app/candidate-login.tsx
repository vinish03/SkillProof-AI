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
} from 'react-native';

export default function CandidateLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        console.log('LOGIN CLICKED');

        if (!email || !password) {
            if (typeof window !== 'undefined') {
                window.alert('Please enter email and password.');
            } else {
                Alert.alert(
                    'Error',
                    'Please enter email and password.'
                );
            }
            return;
        }

        try {
            const response = await fetch(
                'https://skillproof-ai-b0ax.onrender.com/api/candidate/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            console.log('STATUS:', response.status);
            console.log('BACKEND RESPONSE:', data);

            if (!response.ok) {
                if (typeof window !== 'undefined') {
                    window.alert(
                        data.message || 'Invalid email or password.'
                    );
                } else {
                    Alert.alert(
                        'Login Failed',
                        data.message || 'Invalid email or password.'
                    );
                }
                return;
            }

            await AsyncStorage.setItem(
                'candidateId',
                data.candidate.id
            );

            console.log(
                'CANDIDATE ID SAVED:',
                data.candidate.id
            );

            router.replace('/candidate-dashboard');
        } catch (error) {
            console.error('Login error:', error);

            if (typeof window !== 'undefined') {
                window.alert(
                    'Could not connect to the SkillProof AI server.'
                );
            } else {
                Alert.alert(
                    'Connection Error',
                    'Could not connect to the SkillProof AI server.'
                );
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                Candidate Login
            </Text>

            <Text style={styles.subtitle}>
                Welcome back to SkillProof AI
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
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
                    router.push('/candidate-signup')
                }
            >
                <Text style={styles.signupText}>
                    Don't have an account? Create Account
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

    signupText: {
        textAlign: 'center',
        marginTop: 25,
        color: '#5b4ee8',
    },
});