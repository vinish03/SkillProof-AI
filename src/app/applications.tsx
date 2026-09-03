import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'http://192.168.1.3:5000';

export default function Applications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const candidateId =
                await AsyncStorage.getItem('candidateId');

            if (!candidateId) {
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/api/applications/candidate/${candidateId}`
            );

            const data = await response.json();

            if (response.ok) {
                setApplications(data.applications || []);
            }
        } catch (error) {
            console.error('Load applications error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5b4ee8" />
                <Text style={styles.loadingText}>
                    Loading applications...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>My Applications</Text>

            <Text style={styles.subtitle}>
                Track the jobs you have applied for
            </Text>

            {applications.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                        No Applications Yet
                    </Text>

                    <Text style={styles.emptyText}>
                        You haven't applied for any jobs yet.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/jobs')}
                    >
                        <Text style={styles.buttonText}>
                            Browse Jobs
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                applications.map((application) => (
                    <View
                        key={application._id}
                        style={styles.card}
                    >
                        <Text style={styles.jobTitle}>
                            {application.job?.title ||
                                application.jobTitle ||
                                'Job Application'}
                        </Text>

                        <Text style={styles.company}>
                            {application.job?.company ||
                                application.company ||
                                ''}
                        </Text>

                        <Text style={styles.label}>
                            Status
                        </Text>

                        <Text style={styles.status}>
                            {application.status || 'Applied'}
                        </Text>
                    </View>
                ))
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push('/candidate-dashboard')}
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
        backgroundColor: '#f5f6fa',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
    },

    loadingText: {
        marginTop: 12,
        fontSize: 16,
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

    emptyCard: {
        backgroundColor: '#ffffff',
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },

    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 25,
    },

    card: {
        backgroundColor: '#ffffff',
        padding: 22,
        borderRadius: 15,
        marginBottom: 18,
    },

    jobTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    company: {
        fontSize: 17,
        color: '#5b4ee8',
        fontWeight: '600',
        marginBottom: 20,
    },

    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666666',
        marginBottom: 6,
    },

    status: {
        fontSize: 16,
        color: '#16803c',
        fontWeight: 'bold',
    },

    button: {
        backgroundColor: '#5b4ee8',
        padding: 15,
        borderRadius: 10,
        width: '100%',
    },

    backButton: {
        backgroundColor: '#5b4ee8',
        padding: 15,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 30,
    },

    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

