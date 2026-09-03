import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const API_URL = 'https://skillproof-ai-b0ax.onrender.com';

export default function CandidateProfile() {
    const [candidate, setCandidate] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [skills, setSkills] = useState('');
    const [education, setEducation] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const candidateId =
                await AsyncStorage.getItem('candidateId');

            if (!candidateId) {
                Alert.alert(
                    'Error',
                    'Candidate login information not found.'
                );

                router.replace('/candidate-login');
                return;
            }

            const response = await fetch(
                `${API_URL}/api/candidate/profile/${candidateId}`
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(
                    'Error',
                    data.message || 'Could not load profile.'
                );
                return;
            }

            setCandidate(data.candidate);
            setName(data.candidate.name || '');
            setEmail(data.candidate.email || '');
            setSkills(
                Array.isArray(data.candidate.skills)
                    ? data.candidate.skills.join(', ')
                    : ''
            );
            setEducation(data.candidate.education || '');
        } catch (error) {
            console.error('Profile error:', error);

            Alert.alert(
                'Connection Error',
                'Could not connect to the SkillProof AI server.'
            );
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            const candidateId =
                await AsyncStorage.getItem('candidateId');

            if (!candidateId) {
                Alert.alert(
                    'Error',
                    'Candidate login information not found.'
                );
                return;
            }

            if (!name.trim()) {
                Alert.alert(
                    'Error',
                    'Full name is required.'
                );
                return;
            }

            const skillsArray = skills
                .split(',')
                .map((skill) => skill.trim())
                .filter(Boolean);

            setSaving(true);

            const response = await fetch(
                `${API_URL}/api/candidate/profile/${candidateId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        skills: skillsArray,
                        education: education.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(
                    'Error',
                    data.message || 'Could not update profile.'
                );
                return;
            }

            setCandidate(data.candidate);

            Alert.alert(
                'Success',
                'Profile updated successfully.'
            );
        } catch (error) {
            console.error(
                'Profile update error:',
                error
            );

            Alert.alert(
                'Connection Error',
                'Could not connect to the SkillProof AI server.'
            );
        } finally {
            setSaving(false);
        }
    };

    const uploadResume = async () => {
        try {
            const candidateId =
                await AsyncStorage.getItem('candidateId');

            if (!candidateId) {
                Alert.alert(
                    'Error',
                    'Candidate login information not found.'
                );
                return;
            }

            const result =
                await DocumentPicker.getDocumentAsync({
                    type: 'application/pdf',
                    copyToCacheDirectory: true,
                });

            if (result.canceled) {
                return;
            }

            const file = result.assets[0];

            setUploading(true);

            const response = await fetch(file.uri);
            const blob = await response.blob();

            const formData = new FormData();

            formData.append(
                'resume',
                blob,
                file.name
            );

            const uploadResponse = await fetch(
                `${API_URL}/api/candidate/profile/${candidateId}/resume`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await uploadResponse.json();

            if (!uploadResponse.ok) {
                Alert.alert(
                    'Error',
                    data.message || 'Resume upload failed.'
                );
                return;
            }

            setCandidate(data.candidate);

            Alert.alert(
                'Success',
                'Resume uploaded successfully.'
            );
        } catch (error) {
            console.error(
                'Resume upload error:',
                error
            );

            Alert.alert(
                'Error',
                'Could not upload the resume.'
            );
        } finally {
            setUploading(false);
        }
    };

    const viewResume = async () => {
        if (!candidate?.resume) {
            return;
        }

        const resumeUrl =
            `${API_URL}/uploads/${candidate.resume}`;

        try {
            await Linking.openURL(resumeUrl);
        } catch (error) {
            console.error(
                'Resume open error:',
                error
            );

            Alert.alert(
                'Error',
                'Could not open the resume.'
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Loading profile...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                My Profile
            </Text>

            <Text style={styles.subtitle}>
                Manage your personal information
            </Text>

            {candidate && (
                <View style={styles.card}>
                    <Text style={styles.label}>
                        Full Name
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                    />

                    <Text style={styles.label}>
                        Email
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            styles.disabledInput,
                        ]}
                        value={email}
                        editable={false}
                    />

                    <Text style={styles.label}>
                        Skills
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={skills}
                        onChangeText={setSkills}
                        placeholder="Python, React, Node.js"
                    />

                    <Text style={styles.helperText}>
                        Separate multiple skills with commas
                    </Text>

                    <Text style={styles.label}>
                        Education
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            styles.educationInput,
                        ]}
                        value={education}
                        onChangeText={setEducation}
                        placeholder="Enter your education"
                        multiline
                    />

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveProfile}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>
                            {saving
                                ? 'Saving...'
                                : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.resumeLabel}>
                        Resume
                    </Text>

                    {candidate.resume ? (
                        <>
                            <Text style={styles.resumeStatus}>
                                Resume uploaded
                            </Text>

                            <Text
                                style={styles.resumeFileName}
                                numberOfLines={1}
                            >
                                {candidate.resume}
                            </Text>

                            <TouchableOpacity
                                style={styles.viewResumeButton}
                                onPress={viewResume}
                            >
                                <Text style={styles.buttonText}>
                                    View Resume
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.resumeStatus}>
                            No resume uploaded
                        </Text>
                    )}

                    <TouchableOpacity
                        style={styles.resumeButton}
                        onPress={uploadResume}
                        disabled={uploading}
                    >
                        <Text style={styles.buttonText}>
                            {uploading
                                ? 'Uploading...'
                                : candidate.resume
                                    ? 'Replace Resume'
                                    : 'Upload Resume'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.helperText}>
                        PDF files only
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.buttonText}>
                    Back to Dashboard
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#f5f5f5',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },

    loadingText: {
        fontSize: 18,
        color: '#666666',
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 30,
    },

    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
        color: '#666666',
    },

    card: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 15,
        marginBottom: 25,
    },

    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#666666',
        marginTop: 15,
        marginBottom: 5,
    },

    input: {
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },

    disabledInput: {
        backgroundColor: '#eeeeee',
        color: '#777777',
    },

    educationInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },

    helperText: {
        fontSize: 12,
        color: '#888888',
        marginTop: 5,
    },

    saveButton: {
        backgroundColor: '#28a745',
        padding: 16,
        borderRadius: 10,
        marginTop: 25,
    },

    resumeLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#666666',
        marginTop: 25,
        marginBottom: 5,
    },

    resumeStatus: {
        fontSize: 15,
        color: '#444444',
        marginBottom: 5,
    },

    resumeFileName: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 10,
    },

    viewResumeButton: {
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
    },

    resumeButton: {
        backgroundColor: '#5b4ee8',
        padding: 16,
        borderRadius: 10,
        marginTop: 5,
    },

    backButton: {
        backgroundColor: '#5b4ee8',
        padding: 16,
        borderRadius: 10,
    },

    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});