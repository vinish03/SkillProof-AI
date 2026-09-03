import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://skillproof-ai-b0ax.onrender.com';

export default function CompanyJobs() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('Fresher');

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyJobs();
  }, []);

  const loadCompanyJobs = async () => {
    try {
      setLoadingJobs(true);

      const companyName =
        await AsyncStorage.getItem('companyName');

      console.log(
        'COMPANY NAME FOR JOBS:',
        companyName
      );

      if (!companyName) {
        setLoadingJobs(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/jobs/company/${encodeURIComponent(
          companyName
        )}`
      );

      const data = await response.json();

      console.log(
        'COMPANY JOBS STATUS:',
        response.status
      );

      console.log(
        'COMPANY JOBS RESPONSE:',
        data
      );

      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        Alert.alert(
          'Error',
          data.message || 'Unable to load jobs'
        );
      }
    } catch (error) {
      console.error(
        'Load company jobs error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to load company jobs'
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  const createJob = async () => {
    if (!title || !location || !description) {
      Alert.alert(
        'Missing Information',
        'Title, location and description are required'
      );
      return;
    }

    try {
      setLoading(true);

      const companyName =
        await AsyncStorage.getItem('companyName');

      if (!companyName) {
        Alert.alert(
          'Error',
          'Company information not found'
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/jobs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            company: companyName,
            location,
            description,
            skills: skills
              .split(',')
              .map((skill) => skill.trim())
              .filter((skill) => skill),
            salary,
            experience,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'CREATE JOB STATUS:',
        response.status
      );

      console.log(
        'CREATE JOB RESPONSE:',
        data
      );

      if (!response.ok) {
        Alert.alert(
          'Failed',
          data.message || 'Unable to create job'
        );
        return;
      }

      clearForm();

      Alert.alert(
        'Success',
        'Job created successfully'
      );

      loadCompanyJobs();
    } catch (error) {
      console.error(
        'Create job error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to connect to the server'
      );
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (job: any) => {
    setEditingJobId(job._id);

    setTitle(job.title || '');
    setLocation(job.location || '');
    setDescription(job.description || '');

    setSkills(
      job.skills
        ? job.skills.join(', ')
        : ''
    );

    setSalary(job.salary || '');
    setExperience(
      job.experience || 'Fresher'
    );

    Alert.alert(
      'Edit Job',
      'Job details loaded into the form. Make your changes and tap Update Job.'
    );
  };

  const updateJob = async () => {
    if (!editingJobId) {
      return;
    }

    if (!title || !location || !description) {
      Alert.alert(
        'Missing Information',
        'Title, location and description are required'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/jobs/${editingJobId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            location,
            description,
            skills: skills
              .split(',')
              .map((skill) => skill.trim())
              .filter((skill) => skill),
            salary,
            experience,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'UPDATE JOB STATUS:',
        response.status
      );

      console.log(
        'UPDATE JOB RESPONSE:',
        data
      );

      if (!response.ok) {
        Alert.alert(
          'Failed',
          data.message || 'Unable to update job'
        );
        return;
      }

      clearForm();

      Alert.alert(
        'Success',
        'Job updated successfully'
      );

      loadCompanyJobs();
    } catch (error) {
      console.error(
        'Update job error:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to connect to the server'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this job?'
  );

  if (!confirmed) {
    return;
  }

  try {
    console.log('DELETE JOB ID:', jobId);

    const response = await fetch(
      `${API_URL}/api/jobs/${jobId}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();

    console.log(
      'DELETE JOB STATUS:',
      response.status
    );

    console.log(
      'DELETE JOB RESPONSE:',
      data
    );

    if (!response.ok) {
      Alert.alert(
        'Failed',
        data.message || 'Unable to delete job'
      );
      return;
    }

    Alert.alert(
      'Success',
      'Job deleted successfully'
    );

    loadCompanyJobs();
  } catch (error) {
    console.error(
      'Delete job error:',
      error
    );

    Alert.alert(
      'Error',
      'Unable to connect to the server'
    );
  }
};

  const clearForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setSkills('');
    setSalary('');
    setExperience('Fresher');
    setEditingJobId(null);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Manage Jobs
      </Text>

      <Text style={styles.subtitle}>
        {editingJobId
          ? 'Edit your job opening'
          : 'Create a new job opening'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={[
          styles.input,
          styles.description,
        ]}
        placeholder="Job Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Skills (e.g. React, Node.js, MongoDB)"
        value={skills}
        onChangeText={setSkills}
      />

      <TextInput
        style={styles.input}
        placeholder="Salary"
        value={salary}
        onChangeText={setSalary}
      />

      <TextInput
        style={styles.input}
        placeholder="Experience"
        value={experience}
        onChangeText={setExperience}
      />

      {editingJobId ? (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={updateJob}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Updating Job...'
                : 'Update Job'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={clearForm}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              Cancel Edit
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={createJob}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? 'Creating Job...'
              : 'Create Job'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.jobsSection}>
        <Text style={styles.jobsTitle}>
          My Posted Jobs
        </Text>

        {loadingJobs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#5b4ee8"
            />

            <Text style={styles.loadingText}>
              Loading jobs...
            </Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No Jobs Posted
            </Text>

            <Text style={styles.emptyText}>
              You haven't posted any jobs yet.
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
            <View
              key={job._id}
              style={styles.jobCard}
            >
              <Text style={styles.jobTitle}>
                {job.title}
              </Text>

              <Text style={styles.company}>
                {job.company}
              </Text>

              <Text style={styles.jobInfo}>
                Location: {job.location}
              </Text>

              <Text style={styles.jobInfo}>
                Experience: {job.experience}
              </Text>

              {job.salary ? (
                <Text style={styles.jobInfo}>
                  Salary: {job.salary}
                </Text>
              ) : null}

              <Text style={styles.descriptionText}>
                {job.description}
              </Text>

              {job.skills &&
              job.skills.length > 0 ? (
                <Text style={styles.skills}>
                  Skills: {job.skills.join(', ')}
                </Text>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    startEdit(job)
                  }
                >
                  <Text style={styles.buttonText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    deleteJob(job._id)
                  }
                >
                  <Text style={styles.buttonText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

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
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  description: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#5b4ee8',
    padding: 16,
    borderRadius: 10,
    marginTop: 5,
  },

  cancelButton: {
    backgroundColor: '#777777',
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
  },

  jobsSection: {
    marginTop: 35,
  },

  jobsTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  loadingContainer: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#666666',
    fontSize: 16,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: '#666666',
  },

  jobCard: {
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
    marginBottom: 15,
  },

  jobInfo: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 7,
  },

  descriptionText: {
    fontSize: 15,
    color: '#333333',
    marginTop: 12,
    lineHeight: 22,
  },

  skills: {
    fontSize: 15,
    color: '#555555',
    marginTop: 12,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },

  editButton: {
    backgroundColor: '#5b4ee8',
    padding: 13,
    borderRadius: 10,
    flex: 1,
  },

  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 13,
    borderRadius: 10,
    flex: 1,
  },

  backButton: {
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 30,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});