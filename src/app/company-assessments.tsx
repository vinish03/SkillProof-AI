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

type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  skills?: string[];
  salary?: string;
  experience?: string;
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

export default function CompanyAssessments() {
  const [companyName, setCompanyName] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [passingScore, setPassingScore] = useState('60');

  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadCompanyAndJobs();
  }, []);

  const loadCompanyAndJobs = async () => {
    try {
      setLoading(true);

      const name = await AsyncStorage.getItem('companyName');

      console.log('COMPANY NAME FROM STORAGE:', name);

      if (!name) {
        Alert.alert(
          'Login Required',
          'Please login as a company first.'
        );

        router.replace('/company-login');
        return;
      }

      setCompanyName(name);

      const url = `${API_URL}/api/jobs/company/${encodeURIComponent(name)}`;

      console.log('LOADING COMPANY JOBS FROM:', url);

      const response = await fetch(url);

      console.log('COMPANY JOBS STATUS:', response.status);

      const data = await response.json();

      console.log('COMPANY JOBS RESPONSE:', data);

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Could not load your jobs.'
        );
        return;
      }

      if (!Array.isArray(data.jobs)) {
        console.error(
          'Invalid jobs response. Expected array:',
          data.jobs
        );

        setJobs([]);
        return;
      }

      console.log('NUMBER OF COMPANY JOBS:', data.jobs.length);

      setJobs(data.jobs);

      if (data.jobs.length > 0) {
        console.log('FIRST COMPANY JOB:', data.jobs[0]);
      }
    } catch (error) {
      console.error('Load company jobs error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the SkillProof AI server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!selectedJob) {
      Alert.alert(
        'Select Job',
        'Please select a job position first.'
      );
      return;
    }

    try {
      setGenerating(true);

      const url = `${API_URL}/api/assessments/generate/${selectedJob._id}`;

      console.log('GENERATING QUESTIONS FROM:', url);

      const response = await fetch(url);

      const data = await response.json();

      console.log('GENERATE QUESTIONS STATUS:', response.status);
      console.log('GENERATE QUESTIONS RESPONSE:', data);

      if (!response.ok) {
        Alert.alert(
          'Generation Failed',
          data.message || 'Could not generate questions.'
        );
        return;
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        Alert.alert(
          'No Questions',
          'No questions could be generated for this job.'
        );
        return;
      }

      setQuestions(data.questions);

      if (!title.trim()) {
        setTitle(`${selectedJob.title} Technical Assessment`);
      }

      if (!description.trim()) {
        setDescription(
          `Technical assessment for the ${selectedJob.title} position.`
        );
      }

      Alert.alert(
        'Questions Generated',
        `${data.questions.length} questions were generated. You can edit them before creating the assessment.`
      );
    } catch (error) {
      console.error('Generate questions error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the SkillProof AI server.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (
    index: number,
    field: 'question' | 'correctAnswer' | 'points',
    value: string
  ) => {
    setQuestions((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]:
            field === 'points'
              ? Number(value) || 1
              : value,
        };
      })
    );
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((previous) =>
      previous.map((item, index) => {
        if (index !== questionIndex) {
          return item;
        }

        const updatedOptions = [...item.options];
        const oldOption = updatedOptions[optionIndex];

        updatedOptions[optionIndex] = value;

        return {
          ...item,
          options: updatedOptions,
          correctAnswer:
            item.correctAnswer === oldOption ? '' : item.correctAnswer,
        };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((previous) => [
      ...previous,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      Alert.alert(
        'Cannot Remove',
        'An assessment must contain at least one question.'
      );
      return;
    }

    setQuestions((previous) =>
      previous.filter(
        (_, questionIndex) => questionIndex !== index
      )
    );
  };

  const createAssessment = async () => {
    if (!selectedJob) {
      Alert.alert(
        'Select Job',
        'Please select a job position.'
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter an assessment title.'
      );
      return;
    }

    const durationNumber = Number(duration);
    const passingScoreNumber = Number(passingScore);

    if (!durationNumber || durationNumber <= 0) {
      Alert.alert(
        'Invalid Duration',
        'Please enter a valid assessment duration.'
      );
      return;
    }

    if (
      passingScoreNumber < 0 ||
      passingScoreNumber > 100
    ) {
      Alert.alert(
        'Invalid Passing Score',
        'Passing score must be between 0 and 100.'
      );
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const item = questions[i];

      if (!item.question.trim()) {
        Alert.alert(
          'Missing Question',
          `Please enter question ${i + 1}.`
        );
        return;
      }

      if (
        item.options.some(
          (option) => !option.trim()
        )
      ) {
        Alert.alert(
          'Missing Option',
          `Please complete all four options for question ${
            i + 1
          }.`
        );
        return;
      }

      if (!item.correctAnswer) {
        Alert.alert(
          'Correct Answer Required',
          `Please select the correct answer for question ${
            i + 1
          }.`
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/assessments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: selectedJob._id,
            company: companyName,
            title: title.trim(),
            description: description.trim(),
            duration: durationNumber,
            passingScore: passingScoreNumber,
            questions,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'CREATE ASSESSMENT STATUS:',
        response.status
      );

      console.log(
        'CREATE ASSESSMENT RESPONSE:',
        data
      );

      if (!response.ok) {
        Alert.alert(
          'Assessment Failed',
          data.message ||
            'Could not create assessment.'
        );
        return;
      }

      Alert.alert(
        'Assessment Created',
        'The assessment has been created successfully.'
      );

      setTitle('');
      setDescription('');
      setDuration('30');
      setPassingScore('60');
      setSelectedJob(null);

      setQuestions([
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
        },
      ]);
    } catch (error) {
      console.error(
        'Create assessment error:',
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#5b4ee8"
        />

        <Text style={styles.loadingText}>
          Loading your jobs...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Create Assessment
      </Text>

      <Text style={styles.subtitle}>
        Create a company assessment for a job position
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          1. Select Job Position
        </Text>

        {jobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              No jobs found
            </Text>

            <Text style={styles.emptyText}>
              Create a job first before creating an
              assessment.
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                router.push('/company-jobs')
              }
            >
              <Text
                style={styles.secondaryButtonText}
              >
                Manage Jobs
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.companyInfo}>
              Jobs posted by {companyName}
            </Text>

            {jobs.map((job) => {
              const selected =
                selectedJob?._id === job._id;

              return (
                <TouchableOpacity
                  key={job._id}
                  style={[
                    styles.jobOption,
                    selected &&
                      styles.selectedJob,
                  ]}
                  onPress={() =>
                    setSelectedJob(job)
                  }
                >
                  <Text
                    style={[
                      styles.jobTitle,
                      selected &&
                        styles.selectedText,
                    ]}
                  >
                    {job.title}
                  </Text>

                  <Text
                    style={[
                      styles.jobCompany,
                      selected &&
                        styles.selectedText,
                    ]}
                  >
                    {job.company}
                  </Text>

                  {job.location && (
                    <Text
                      style={[
                        styles.jobDetails,
                        selected &&
                          styles.selectedText,
                      ]}
                    >
                      Location: {job.location}
                    </Text>
                  )}

                  {job.experience && (
                    <Text
                      style={[
                        styles.jobDetails,
                        selected &&
                          styles.selectedText,
                      ]}
                    >
                      Experience: {job.experience}
                    </Text>
                  )}

                  {selected && (
                    <Text
                      style={styles.selectedLabel}
                    >
                      ✓ Selected
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. Assessment Details
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Assessment Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[
            styles.input,
            styles.descriptionInput,
          ]}
          placeholder="Assessment Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          style={styles.input}
          placeholder="Duration in minutes"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <TextInput
          style={styles.input}
          placeholder="Passing score (%)"
          keyboardType="numeric"
          value={passingScore}
          onChangeText={setPassingScore}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          3. Assessment Questions
        </Text>

        <TouchableOpacity
          style={[
            styles.generateButton,
            (!selectedJob || generating) &&
              styles.disabledButton,
          ]}
          onPress={generateQuestions}
          disabled={!selectedJob || generating}
        >
          <Text style={styles.generateButtonText}>
            {generating
              ? 'Generating Questions...'
              : 'Generate Questions'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.generateHint}>
          Select a job first, then generate questions based
          on its required skills.
        </Text>

        {questions.map(
          (item, questionIndex) => (
            <View
              key={questionIndex}
              style={styles.questionCard}
            >
              <View
                style={styles.questionHeader}
              >
                <Text
                  style={
                    styles.questionNumber
                  }
                >
                  Question {questionIndex + 1}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    removeQuestion(
                      questionIndex
                    )
                  }
                >
                  <Text
                    style={styles.removeText}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.questionInput,
                ]}
                placeholder="Enter question"
                multiline
                value={item.question}
                onChangeText={(value) =>
                  updateQuestion(
                    questionIndex,
                    'question',
                    value
                  )
                }
              />

              {item.options.map(
                (option, optionIndex) => (
                  <TextInput
                    key={optionIndex}
                    style={styles.input}
                    placeholder={`Option ${
                      optionIndex + 1
                    }`}
                    value={option}
                    onChangeText={(value) =>
                      updateOption(
                        questionIndex,
                        optionIndex,
                        value
                      )
                    }
                  />
                )
              )}

              <Text
                style={styles.correctLabel}
              >
                Select Correct Answer
              </Text>

              {item.options.map(
                (option, optionIndex) => {
                  const isCorrect =
                    item.correctAnswer ===
                      option &&
                    option.trim() !== '';

                  return (
                    <TouchableOpacity
                      key={optionIndex}
                      disabled={
                        !option.trim()
                      }
                      style={[
                        styles.answerOption,
                        isCorrect &&
                          styles.correctOption,
                      ]}
                      onPress={() =>
                        updateQuestion(
                          questionIndex,
                          'correctAnswer',
                          option
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.answerText,
                          isCorrect &&
                            styles.correctText,
                        ]}
                      >
                        {isCorrect ? '✓ ' : ''}
                        {option ||
                          `Option ${
                            optionIndex + 1
                          }`}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}

              <TextInput
                style={styles.input}
                placeholder="Points for this question"
                keyboardType="numeric"
                value={String(item.points)}
                onChangeText={(value) =>
                  updateQuestion(
                    questionIndex,
                    'points',
                    value
                  )
                }
              />
            </View>
          )
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={addQuestion}
        >
          <Text style={styles.addButtonText}>
            + Add Another Question
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.createButton,
          saving &&
            styles.disabledButton,
        ]}
        onPress={createAssessment}
        disabled={saving}
      >
        <Text style={styles.createButtonText}>
          {saving
            ? 'Creating Assessment...'
            : 'Create Assessment'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.replace('/company-dashboard')
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
    padding: 20,
    paddingBottom: 40,
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

  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#202020',
    marginTop: 25,
  },

  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  section: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 15,
    color: '#202020',
  },

  companyInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },

  jobOption: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },

  selectedJob: {
    backgroundColor: '#eeecff',
    borderColor: '#5b4ee8',
  },

  jobTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  jobCompany: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },

  jobDetails: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  selectedText: {
    color: '#5b4ee8',
  },

  selectedLabel: {
    marginTop: 8,
    color: '#5b4ee8',
    fontWeight: '700',
    fontSize: 13,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 9,
    padding: 13,
    marginBottom: 12,
    fontSize: 15,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  emptyBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f9',
    borderRadius: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 15,
  },

  secondaryButton: {
    backgroundColor: '#333333',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  secondaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  generateButton: {
    backgroundColor: '#5b4ee8',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 8,
  },

  generateButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  generateHint: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 15,
  },

  questionCard: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },

  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  removeText: {
    color: '#d32f2f',
    fontWeight: '600',
  },

  questionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  correctLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 8,
  },

  answerOption: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 11,
    marginBottom: 7,
    backgroundColor: '#ffffff',
  },

  correctOption: {
    backgroundColor: '#eeecff',
    borderColor: '#5b4ee8',
  },

  answerText: {
    fontSize: 14,
    color: '#444444',
  },

  correctText: {
    color: '#5b4ee8',
    fontWeight: '700',
  },

  addButton: {
    borderWidth: 1,
    borderColor: '#5b4ee8',
    borderRadius: 9,
    padding: 13,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#5b4ee8',
    fontWeight: '700',
    fontSize: 15,
  },

  createButton: {
    backgroundColor: '#5b4ee8',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },

  backButton: {
    backgroundColor: '#333333',
    padding: 14,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
});