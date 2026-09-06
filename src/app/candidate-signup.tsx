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

export default function CandidateSignup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [skills, setSkills] = useState('');
    const [education, setEducation] = useState('');

    const handleSignup = async () => {
        console.log('CREATE ACCOUNT CLICKED');

        if (!name || !email || !password) {
            if (typeof window !== 'undefined') {
                window.alert(
                    'Please fill in name, email and password.'
                );
            } else {
                Alert.alert(
                    'Error',
                    'Please fill in name, email and password.'
                );
            }
            return;
        }

        if (password !== confirmPassword) {
            if (typeof window !== 'undefined') {
                window.alert('Passwords do not match.');
            } else {
                Alert.alert(
                    'Error',
                    'Passwords do not match.'
                );
            }
            return;
        }

        try {
            const response = await fetch(
                'https://skillproof-ai-b0ax.onrender.com/api/candidate/signup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        skills: skills
                            .split(',')
                            .map((skill) => skill.trim())
                            .filter(Boolean),
                        education,
                    }),
                }
            );

            const data = await response.json();

            console.log('STATUS:', response.status);
            console.log('BACKEND RESPONSE:', data);

            if (!response.ok) {
                if (typeof window !== 'undefined') {
                    window.alert(
                        data.message || 'Something went wrong.'
                    );
                } else {
                    Alert.alert(
                        'Signup Failed',
                        data.message || 'Something went wrong.'
                    );
                }
                return;
            }

            if (typeof window !== 'undefined') {
                window.alert(
                    'Candidate account created successfully!'
                );
                router.push('/candidate-login');
            } else {
                Alert.alert(
                    'Success',
                    'Candidate account created successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                router.push('/candidate-login'),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Signup error:', error);

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
                Create Candidate Account
            </Text>

            <Text style={styles.subtitle}>
                Start proving your skills with SkillProof AI
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />

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

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Skills (e.g. Python, React, SQL)"
                value={skills}
                onChangeText={setSkills}
            />

            <TextInput
                style={styles.input}
                placeholder="Education"
                value={education}
                onChangeText={setEducation}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
            >
                <Text style={styles.buttonText}>
                    Create Account
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push('/candidate-login')}
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