import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'https://skillproof-ai-b0ax.onrender.com';

const normalizeSkill = (skill: string) =>
    skill.toLowerCase().replace(/[^a-z0-9]/g, '');

const getSkillMatch = (
    jobSkills: string[] = [],
    candidateSkills: string[] = []
) => {
    if (!jobSkills.length || !candidateSkills.length) {
        return 0;
    }

    const candidateSkillSet = candidateSkills.map(normalizeSkill);

    const matchedSkills = jobSkills.filter((skill) =>
        candidateSkillSet.includes(normalizeSkill(skill))
    );

    return Math.round(
        (matchedSkills.length / jobSkills.length) * 100
    );
};

export default function Jobs() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
    const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const candidateId =
                await AsyncStorage.getItem('candidateId');

            if (!candidateId) {
                Alert.alert(
                    'Login Required',
                    'Please login to view and apply for jobs.'
                );

                router.replace('/candidate-login');
                return;
            }

            const jobsResponse = await fetch(
                `${API_URL}/api/jobs`
            );

            const jobsData = await jobsResponse.json();

            if (!jobsResponse.ok) {
                Alert.alert(
                    'Error',
                    jobsData.message || 'Could not load jobs.'
                );
                return;
            }

            setJobs(jobsData.jobs || []);

            const candidateResponse = await fetch(
                `${API_URL}/api/candidate/profile/${candidateId}`
            );

            const candidateData =
                await candidateResponse.json();

            if (candidateResponse.ok) {
                const skills = candidateData.candidate?.skills;

                if (Array.isArray(skills)) {
                    setCandidateSkills(skills);
                } else if (typeof skills === 'string') {
                    setCandidateSkills(
                        skills
                            .split(',')
                            .map((skill: string) => skill.trim())
                            .filter(Boolean)
                    );
                }
            }

            const applicationsResponse = await fetch(
                `${API_URL}/api/applications/candidate/${candidateId}`
            );

            const applicationsData =
                await applicationsResponse.json();

            if (applicationsResponse.ok) {
                const jobIds =
                    (applicationsData.applications || []).map(
                        (application: any) =>
                            application.jobId.toString()
                    );

                setAppliedJobs(jobIds);
            }
        } catch (error) {
            console.error('Load jobs error:', error);

            Alert.alert(
                'Connection Error',
                'Could not connect to the SkillProof AI server.'
            );
        } finally {
            setLoading(false);
        }
    };

    const applyForJob = async (job: any) => {
        try {
            const candidateId =
                await AsyncStorage.getItem('candidateId');

            if (!candidateId) {
                Alert.alert(
                    'Login Required',
                    'Please login before applying.'
                );
                return;
            }

            if (appliedJobs.includes(job._id.toString())) {
                Alert.alert(
                    'Already Applied',
                    'You have already applied for this job.'
                );
                return;
            }

            const candidateResponse = await fetch(
                `${API_URL}/api/candidate/profile/${candidateId}`
            );

            const candidateData =
                await candidateResponse.json();

            if (!candidateResponse.ok) {
                Alert.alert(
                    'Error',
                    candidateData.message ||
                    'Could not load candidate profile.'
                );
                return;
            }

            const response = await fetch(
                `${API_URL}/api/applications/apply`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        candidateId,
                        candidateName:
                            candidateData.candidate.name,
                        candidateEmail:
                            candidateData.candidate.email,
                        jobId: job._id,
                        jobTitle: job.title,
                        company: job.company,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(
                    'Application Failed',
                    data.message ||
                    'Could not submit application.'
                );
                return;
            }

            setAppliedJobs((previous) => [
                ...previous,
                job._id.toString(),
            ]);

            Alert.alert(
                'Application Submitted',
                `Your application for ${job.title} has been submitted successfully.`
            );
        } catch (error) {
            console.error('Apply job error:', error);

            Alert.alert(
                'Connection Error',
                'Could not connect to the SkillProof AI server.'
            );
        }
    };

    const takeAssessment = (job: any) => {
        router.push({
            pathname: '/assessment',
            params: {
                jobId: job._id.toString(),
            },
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color="#5b4ee8"
                />

                <Text style={styles.loadingText}>
                    Finding jobs for you...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    Find Jobs
                </Text>

                <Text style={styles.subtitle}>
                    Discover opportunities that match your skills
                </Text>
            </View>

            {jobs.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>
                        🔍
                    </Text>

                    <Text style={styles.emptyTitle}>
                        No jobs available
                    </Text>

                    <Text style={styles.emptyText}>
                        Check again later for new opportunities.
                    </Text>
                </View>
            ) : (
                <View>
                    <Text style={styles.resultText}>
                        {jobs.length}{' '}
                        {jobs.length === 1
                            ? 'job'
                            : 'jobs'}{' '}
                        available
                    </Text>

                    {jobs.map((job) => {
                        const isApplied =
                            appliedJobs.includes(
                                job._id.toString()
                            );

                        const matchPercentage =
                            getSkillMatch(
                                job.skills || [],
                                candidateSkills
                            );

                        return (
                            <View
                                key={job._id}
                                style={styles.jobCard}
                            >
                                <View style={styles.jobCardTop}>
                                    <View style={styles.companyLogo}>
                                        <Text style={styles.companyLogoText}>
                                            {job.company
                                                ? job.company
                                                    .charAt(0)
                                                    .toUpperCase()
                                                : 'C'}
                                        </Text>
                                    </View>

                                    <View style={styles.jobHeading}>
                                        <Text style={styles.jobTitle}>
                                            {job.title}
                                        </Text>

                                        <Text style={styles.company}>
                                            {job.company}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.matchBadge,
                                            matchPercentage >= 60
                                                ? styles.matchGood
                                                : matchPercentage >= 30
                                                    ? styles.matchMedium
                                                    : styles.matchLow,
                                        ]}
                                    >
                                        <Text style={styles.matchText}>
                                            {matchPercentage}% Match
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailsRow}>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>
                                            📍
                                        </Text>

                                        <Text style={styles.detailText}>
                                            {job.location ||
                                                'Not specified'}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>
                                            💼
                                        </Text>

                                        <Text style={styles.detailText}>
                                            {job.experience ||
                                                'Fresher'}
                                        </Text>
                                    </View>

                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>
                                            💰
                                        </Text>

                                        <Text style={styles.detailText}>
                                            {job.salary ||
                                                'Not specified'}
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={styles.description}
                                    numberOfLines={3}
                                >
                                    {job.description ||
                                        'No description available.'}
                                </Text>

                                {job.skills &&
                                    job.skills.length > 0 && (
                                        <View
                                            style={
                                                styles.skillsContainer
                                            }
                                        >
                                            {job.skills
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        skill: string,
                                                        index: number
                                                    ) => (
                                                        <View
                                                            key={index}
                                                            style={
                                                                styles.skillTag
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.skillText
                                                                }
                                                            >
                                                                {skill}
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                        </View>
                                    )}

                                <View style={styles.cardBottom}>
                                    <Text style={styles.postedText}>
                                        Apply to this position
                                    </Text>

                                    <TouchableOpacity
                                        style={[
                                            styles.applyButton,
                                            isApplied &&
                                            styles.appliedButton,
                                        ]}
                                        onPress={() =>
                                            applyForJob(job)
                                        }
                                        disabled={isApplied}
                                    >
                                        <Text
                                            style={
                                                styles.applyButtonText
                                            }
                                        >
                                            {isApplied
                                                ? 'Applied ✓'
                                                : 'Apply Now'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.assessmentButton}
                                    onPress={() =>
                                        takeAssessment(job)
                                    }
                                >
                                    <Text
                                        style={
                                            styles.assessmentButtonText
                                        }
                                    >
                                        Take Assessment
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                    router.replace('/candidate-dashboard')
                }
            >
                <Text style={styles.backButtonText}>
                    ← Back to Dashboard
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 30,
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
        fontSize: 15,
        color: '#666666',
    },

    header: {
        marginBottom: 22,
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1f1f1f',
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 15,
        color: '#6b6b6b',
        textAlign: 'center',
        marginTop: 7,
        lineHeight: 21,
    },

    resultText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555555',
        marginBottom: 12,
    },

    jobCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eeeeee',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
    },

    jobCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eeecff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    companyLogoText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#5b4ee8',
    },

    jobHeading: {
        flex: 1,
    },

    jobTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#202020',
    },

    company: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5b4ee8',
        marginTop: 4,
    },

    matchBadge: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginLeft: 8,
    },

    matchGood: {
        backgroundColor: '#e8f7ee',
    },

    matchMedium: {
        backgroundColor: '#fff4dc',
    },

    matchLow: {
        backgroundColor: '#f1f1f1',
    },

    matchText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#333333',
    },

    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
        gap: 10,
    },

    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7f7f9',
        paddingVertical: 7,
        paddingHorizontal: 9,
        borderRadius: 8,
    },

    detailIcon: {
        fontSize: 13,
        marginRight: 5,
    },

    detailText: {
        fontSize: 12,
        color: '#555555',
        fontWeight: '500',
    },

    description: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 20,
        marginTop: 14,
    },

    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
        marginTop: 13,
    },

    skillTag: {
        backgroundColor: '#f0efff',
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderRadius: 7,
    },

    skillText: {
        fontSize: 12,
        color: '#5b4ee8',
        fontWeight: '600',
    },

    cardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 17,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
    },

    postedText: {
        flex: 1,
        fontSize: 12,
        color: '#888888',
        marginRight: 10,
    },

    applyButton: {
        backgroundColor: '#5b4ee8',
        paddingVertical: 11,
        paddingHorizontal: 18,
        borderRadius: 9,
    },

    appliedButton: {
        backgroundColor: '#777777',
    },

    applyButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },

    assessmentButton: {
        backgroundColor: '#333333',
        paddingVertical: 11,
        borderRadius: 9,
        marginTop: 10,
    },

    assessmentButtonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '700',
    },

    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 35,
        alignItems: 'center',
    },

    emptyIcon: {
        fontSize: 35,
        marginBottom: 10,
    },

    emptyTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#222222',
    },

    emptyText: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        marginTop: 7,
    },

    backButton: {
        backgroundColor: '#333333',
        paddingVertical: 13,
        borderRadius: 9,
        marginTop: 5,
    },

    backButtonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});