import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'https://skillproof-ai-b0ax.onrender.com';

export default function CompanyApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] =
        useState<any>(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const updateStatus = async (
        applicationId: string,
        status: string
    ) => {
        try {
            const response = await fetch(
                `${API_URL}/api/applications/${applicationId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            console.log('UPDATE STATUS:', response.status);
            console.log('UPDATE STATUS RESPONSE:', data);

            if (!response.ok) {
                return;
            }

            setApplications((currentApplications) =>
                currentApplications.map((application) =>
                    application._id === applicationId
                        ? {
                              ...application,
                              status: data.application.status,
                          }
                        : application
                )
            );
        } catch (error) {
            console.error(
                'Update application status error:',
                error
            );
        }
    };

    const loadApplications = async () => {
        try {
            const companyName =
                await AsyncStorage.getItem('companyName');

            console.log(
                'COMPANY NAME FROM STORAGE:',
                companyName
            );

            if (!companyName) {
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/api/applications/company/${encodeURIComponent(
                    companyName
                )}`
            );

            const data = await response.json();

            console.log(
                'COMPANY APPLICATIONS STATUS:',
                response.status
            );

            console.log(
                'COMPANY APPLICATIONS RESPONSE:',
                data
            );

            if (response.ok) {
                setApplications(data.applications || []);
            }
        } catch (error) {
            console.error(
                'Load company applications error:',
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const openResume = async (resume: string) => {
        try {
            const resumeUrl = `${API_URL}/uploads/${resume}`;
            await Linking.openURL(resumeUrl);
        } catch (error) {
            console.error('Open resume error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color="#5b4ee8"
                />

                <Text style={styles.loadingText}>
                    Loading applications...
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>
                    Applications
                </Text>

                <Text style={styles.subtitle}>
                    Candidates who applied for your jobs
                </Text>

                {applications.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>
                            No Applications Yet
                        </Text>

                        <Text style={styles.emptyText}>
                            No candidates have applied for your
                            jobs yet.
                        </Text>
                    </View>
                ) : (
                    applications.map((application) => {
                        const assessmentResult =
                            application.assessmentResult;

                        return (
                            <View
                                key={application._id}
                                style={styles.card}
                            >
                                <Text style={styles.jobTitle}>
                                    {application.jobTitle}
                                </Text>

                                <Text style={styles.company}>
                                    {application.company}
                                </Text>

                                <Text style={styles.label}>
                                    Candidate
                                </Text>

                                <Text style={styles.value}>
                                    {application.candidateName}
                                </Text>

                                <Text style={styles.label}>
                                    Email
                                </Text>

                                <Text style={styles.value}>
                                    {application.candidateEmail}
                                </Text>

                                {application.candidateProfile && (
                                    <TouchableOpacity
                                        style={
                                            styles.profileButton
                                        }
                                        onPress={() =>
                                            setSelectedCandidate({
                                                ...application.candidateProfile,
                                                assessmentResult:
                                                    application.assessmentResult ||
                                                    null,
                                                jobTitle:
                                                    application.jobTitle,
                                            })
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.profileButtonText
                                            }
                                        >
                                            View Candidate Profile
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <View
                                    style={
                                        styles.assessmentSection
                                    }
                                >
                                    <Text
                                        style={
                                            styles.assessmentHeading
                                        }
                                    >
                                        Assessment
                                    </Text>

                                    {assessmentResult ? (
                                        <>
                                            <Text
                                                style={
                                                    styles.assessmentTitle
                                                }
                                            >
                                                Assessment Completed
                                            </Text>

                                            <Text
                                                style={styles.label}
                                            >
                                                Score
                                            </Text>

                                            <Text
                                                style={styles.value}
                                            >
                                                {
                                                    assessmentResult.score
                                                }{' '}
                                                /{' '}
                                                {
                                                    assessmentResult.totalPoints
                                                }
                                            </Text>

                                            <Text
                                                style={styles.label}
                                            >
                                                Percentage
                                            </Text>

                                            <Text
                                                style={
                                                    styles.percentage
                                                }
                                            >
                                                {
                                                    assessmentResult.percentage
                                                }
                                                %
                                            </Text>

                                            <Text
                                                style={styles.label}
                                            >
                                                Result
                                            </Text>

                                            <Text
                                                style={[
                                                    styles.result,
                                                    assessmentResult.passed
                                                        ? styles.passed
                                                        : styles.failed,
                                                ]}
                                            >
                                                {assessmentResult.passed
                                                    ? 'Passed'
                                                    : 'Not Passed'}
                                            </Text>
                                        </>
                                    ) : (
                                        <Text
                                            style={
                                                styles.notCompleted
                                            }
                                        >
                                            Assessment not completed
                                        </Text>
                                    )}
                                </View>

                                <Text style={styles.label}>
                                    Application Status
                                </Text>

                                <Text style={styles.status}>
                                    {application.status}
                                </Text>

                                <View
                                    style={
                                        styles.statusButtons
                                    }
                                >
                                    <TouchableOpacity
                                        style={
                                            styles.statusButton
                                        }
                                        onPress={() =>
                                            updateStatus(
                                                application._id,
                                                'Under Review'
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.statusButtonText
                                            }
                                        >
                                            Under Review
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={
                                            styles.statusButton
                                        }
                                        onPress={() =>
                                            updateStatus(
                                                application._id,
                                                'Shortlisted'
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.statusButtonText
                                            }
                                        >
                                            Shortlist
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={
                                            styles.rejectButton
                                        }
                                        onPress={() =>
                                            updateStatus(
                                                application._id,
                                                'Rejected'
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.statusButtonText
                                            }
                                        >
                                            Reject
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        router.push('/company-dashboard')
                    }
                >
                    <Text style={styles.buttonText}>
                        Back to Dashboard
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={selectedCandidate !== null}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setSelectedCandidate(null)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>
                                Candidate Profile
                            </Text>

                            {selectedCandidate && (
                                <>
                                    <Text style={styles.label}>
                                        Full Name
                                    </Text>

                                    <Text style={styles.value}>
                                        {selectedCandidate.name}
                                    </Text>

                                    <Text style={styles.label}>
                                        Email
                                    </Text>

                                    <Text style={styles.value}>
                                        {selectedCandidate.email}
                                    </Text>

                                    <Text style={styles.label}>
                                        Skills
                                    </Text>

                                    <Text style={styles.value}>
                                        {selectedCandidate.skills?.length
                                            ? selectedCandidate.skills.join(
                                                  ', '
                                              )
                                            : 'No skills added'}
                                    </Text>

                                    <Text style={styles.label}>
                                        Education
                                    </Text>

                                    <Text style={styles.value}>
                                        {selectedCandidate.education ||
                                            'Not provided'}
                                    </Text>

                                    <Text style={styles.label}>
                                        Applied For
                                    </Text>

                                    <Text style={styles.value}>
                                        {selectedCandidate.jobTitle ||
                                            'Not available'}
                                    </Text>

                                    <View
                                        style={
                                            styles.modalAssessmentSection
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.assessmentHeading
                                            }
                                        >
                                            Assessment Result
                                        </Text>

                                        {selectedCandidate.assessmentResult ? (
                                            <>
                                                <Text
                                                    style={
                                                        styles.label
                                                    }
                                                >
                                                    Score
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.value
                                                    }
                                                >
                                                    {
                                                        selectedCandidate
                                                            .assessmentResult
                                                            .score
                                                    }{' '}
                                                    /{' '}
                                                    {
                                                        selectedCandidate
                                                            .assessmentResult
                                                            .totalPoints
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.label
                                                    }
                                                >
                                                    Percentage
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.percentage
                                                    }
                                                >
                                                    {
                                                        selectedCandidate
                                                            .assessmentResult
                                                            .percentage
                                                    }
                                                    %
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.label
                                                    }
                                                >
                                                    Result
                                                </Text>

                                                <Text
                                                    style={[
                                                        styles.result,
                                                        selectedCandidate
                                                            .assessmentResult
                                                            .passed
                                                            ? styles.passed
                                                            : styles.failed,
                                                    ]}
                                                >
                                                    {selectedCandidate
                                                        .assessmentResult
                                                        .passed
                                                        ? 'Passed'
                                                        : 'Not Passed'}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text
                                                style={
                                                    styles.notCompleted
                                                }
                                            >
                                                Assessment not completed
                                            </Text>
                                        )}
                                    </View>

                                    <Text style={styles.label}>
                                        Resume
                                    </Text>

                                    {selectedCandidate.resume ? (
                                        <TouchableOpacity
                                            style={
                                                styles.resumeButton
                                            }
                                            onPress={() =>
                                                openResume(
                                                    selectedCandidate.resume
                                                )
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.statusButtonText
                                                }
                                            >
                                                View Resume
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text
                                            style={
                                                styles.notCompleted
                                            }
                                        >
                                            Resume not uploaded
                                        </Text>
                                    )}
                                </>
                            )}

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() =>
                                    setSelectedCandidate(null)
                                }
                            >
                                <Text
                                    style={styles.buttonText}
                                >
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
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
        marginTop: 10,
        marginBottom: 5,
    },

    value: {
        fontSize: 16,
        color: '#333333',
    },

    profileButton: {
        backgroundColor: '#5b4ee8',
        padding: 12,
        borderRadius: 8,
        marginTop: 18,
    },

    profileButtonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
    },

    assessmentSection: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
    },

    modalAssessmentSection: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
    },

    assessmentHeading: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#222222',
        marginBottom: 8,
    },

    assessmentTitle: {
        fontSize: 15,
        color: '#555555',
        marginBottom: 5,
    },

    percentage: {
        fontSize: 18,
        color: '#5b4ee8',
        fontWeight: 'bold',
    },

    result: {
        fontSize: 17,
        fontWeight: 'bold',
    },

    passed: {
        color: '#16803c',
    },

    failed: {
        color: '#c62828',
    },

    notCompleted: {
        fontSize: 15,
        color: '#888888',
    },

    status: {
        fontSize: 16,
        color: '#16803c',
        fontWeight: 'bold',
    },

    statusButtons: {
        marginTop: 15,
    },

    statusButton: {
        backgroundColor: '#5b4ee8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },

    rejectButton: {
        backgroundColor: '#c62828',
        padding: 12,
        borderRadius: 8,
    },

    statusButtonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },

    modalCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        maxHeight: '80%',
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },

    resumeButton: {
        backgroundColor: '#16803c',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },

    closeButton: {
        backgroundColor: '#555555',
        padding: 14,
        borderRadius: 8,
        marginTop: 25,
    },
});