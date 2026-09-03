import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CandidateDashboard() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Candidate Dashboard</Text>

            <Text style={styles.subtitle}>
                Welcome to SkillProof AI
            </Text>

            {/* My Profile */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>My Profile</Text>

                <Text style={styles.cardText}>
                    Manage your personal information, skills and education.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/candidate-profile')}
                >
                    <Text style={styles.buttonText}>
                        View Profile
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Find Jobs */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Find Jobs</Text>

                <Text style={styles.cardText}>
                    Explore jobs that match your skills.
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

            {/* Skill Assessment */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Skill Assessment</Text>

                <Text style={styles.cardText}>
                    Prove your skills through AI-powered assessments.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/assessment')}
                >
                    <Text style={styles.buttonText}>
                        Take Assessment
                    </Text>
                </TouchableOpacity>
            </View>

            {/* My Applications */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>My Applications</Text>

                <Text style={styles.cardText}>
                    Track the jobs you have applied for.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/applications')}
                >
                    <Text style={styles.buttonText}>
                        View Applications
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => router.replace('/candidate-login')}
            >
                <Text style={styles.logoutText}>
                    Logout
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
        padding: 20,
        borderRadius: 12,
        marginBottom: 18,
    },

    cardTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    cardText: {
        fontSize: 15,
        color: '#666666',
        lineHeight: 22,
        marginBottom: 15,
    },

    button: {
        backgroundColor: '#5b4ee8',
        padding: 14,
        borderRadius: 10,
    },

    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
    },

    logoutButton: {
        borderWidth: 1,
        borderColor: '#5b4ee8',
        padding: 14,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 30,
    },

    logoutText: {
        color: '#5b4ee8',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
});