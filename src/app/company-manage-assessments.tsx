import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.3:5000';

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

type Assessment = {
  _id: string;
  jobId: string;
  company: string;
  title: string;
  description?: string;
  duration: number;
  passingScore: number;
  questions: Question[];
  published?: boolean;
  isPublished?: boolean;
  status?: string;
  createdAt?: string;
};

export default function CompanyManageAssessments() {
  const [companyName, setCompanyName] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [editingAssessment, setEditingAssessment] =
    useState<Assessment | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPassingScore, setEditPassingScore] = useState('');
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);

      const name = await AsyncStorage.getItem('companyName');

      if (!name) {
        Alert.alert(
          'Login Required',
          'Please login as a company first.'
        );
        router.replace('/company-login');
        return;
      }

      setCompanyName(name);

      const response = await fetch(
        `${API_URL}/api/assessments/company/${encodeURIComponent(name)}`
      );

      const data = await response.json();

      console.log('ASSESSMENTS STATUS:', response.status);
      console.log('ASSESSMENTS RESPONSE:', data);

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Could not load assessments.'
        );
        return;
      }

      setAssessments(
        Array.isArray(data.assessments)
          ? data.assessments
          : []
      );
    } catch (error) {
      console.error('Load assessments error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the SkillProof AI server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const publishAssessment = async (assessmentId: string) => {
    try {
      setPublishingId(assessmentId);

      const response = await fetch(
        `${API_URL}/api/assessments/${assessmentId}/publish`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Publish Failed',
          data.message || 'Could not publish assessment.'
        );
        return;
      }

      Alert.alert(
        'Assessment Published',
        'Candidates can now take this assessment.'
      );

      await loadAssessments();
    } catch (error) {
      console.error('Publish assessment error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the SkillProof AI server.'
      );
    } finally {
      setPublishingId(null);
    }
  };

  const deleteAssessment = (assessmentId: string) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(assessmentId);

              const response = await fetch(
                `${API_URL}/api/assessments/${assessmentId}`,
                {
                  method: 'DELETE',
                }
              );

              const data = await response.json();

              if (!response.ok) {
                Alert.alert(
                  'Delete Failed',
                  data.message || 'Could not delete assessment.'
                );
                return;
              }

              setAssessments((currentAssessments) =>
                currentAssessments.filter(
                  (assessment) =>
                    assessment._id !== assessmentId
                )
              );

              Alert.alert(
                'Assessment Deleted',
                'The assessment was deleted successfully.'
              );
            } catch (error) {
              console.error(
                'Delete assessment error:',
                error
              );

              Alert.alert(
                'Connection Error',
                'Could not connect to the SkillProof AI server.'
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const openEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);

    setEditTitle(assessment.title);
    setEditDescription(assessment.description || '');
    setEditDuration(String(assessment.duration));
    setEditPassingScore(String(assessment.passingScore));

    setEditQuestions(
      assessment.questions.map((question) => ({
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        points: question.points || 1,
      }))
    );
  };

  const updateQuestionText = (
    questionIndex: number,
    value: string
  ) => {
    setEditQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              question: value,
            }
          : question
      )
    );
  };

  const updateOptionText = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setEditQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = [...question.options];
        const oldOption = updatedOptions[optionIndex];

        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
          correctAnswer:
            question.correctAnswer === oldOption
              ? value
              : question.correctAnswer,
        };
      })
    );
  };

  const setCorrectAnswer = (
    questionIndex: number,
    option: string
  ) => {
    setEditQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              correctAnswer: option,
            }
          : question
      )
    );
  };

  const saveAssessment = async () => {
    if (!editingAssessment) {
      return;
    }

    if (
      !editTitle.trim() ||
      !editDuration.trim() ||
      !editPassingScore.trim()
    ) {
      Alert.alert(
        'Missing Information',
        'Title, duration and passing score are required.'
      );
      return;
    }

    if (editQuestions.length === 0) {
      Alert.alert(
        'Missing Questions',
        'An assessment must contain at least one question.'
      );
      return;
    }

    for (let i = 0; i < editQuestions.length; i++) {
      const question = editQuestions[i];

      if (!question.question.trim()) {
        Alert.alert(
          'Invalid Question',
          `Question ${i + 1} cannot be empty.`
        );
        return;
      }

      if (question.options.length === 0) {
        Alert.alert(
          'Invalid Question',
          `Question ${i + 1} must have options.`
        );
        return;
      }

      if (
        question.options.some(
          (option) => !option.trim()
        )
      ) {
        Alert.alert(
          'Invalid Options',
          `Question ${i + 1} contains an empty option.`
        );
        return;
      }

      if (!question.correctAnswer.trim()) {
        Alert.alert(
          'Correct Answer Required',
          `Select a correct answer for Question ${i + 1}.`
        );
        return;
      }
    }

    try {
      setSavingId(editingAssessment._id);

      const response = await fetch(
        `${API_URL}/api/assessments/${editingAssessment._id}/edit`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            duration: Number(editDuration),
            passingScore: Number(editPassingScore),
            questions: editQuestions,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'UPDATE ASSESSMENT STATUS:',
        response.status
      );

      console.log(
        'UPDATE ASSESSMENT RESPONSE:',
        data
      );

      if (!response.ok) {
        Alert.alert(
          'Update Failed',
          data.message || 'Could not update assessment.'
        );
        return;
      }

      setAssessments((currentAssessments) =>
        currentAssessments.map((assessment) =>
          assessment._id === editingAssessment._id
            ? data.assessment
            : assessment
        )
      );

      setEditingAssessment(null);

      Alert.alert(
        'Assessment Updated',
        'The assessment was updated successfully.'
      );
    } catch (error) {
      console.error(
        'Update assessment error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Could not connect to the SkillProof AI server.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const isPublished = (assessment: Assessment) => {
    return (
      assessment.status === 'published' ||
      assessment.published === true ||
      assessment.isPublished === true
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#5b4ee8"
        />

        <Text style={styles.loadingText}>
          Loading assessments...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Manage Assessments
        </Text>

        <Text style={styles.subtitle}>
          Assessments created by {companyName}
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            router.push('/company-assessments')
          }
        >
          <Text style={styles.createButtonText}>
            + Create New Assessment
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Assessments
          </Text>

          {assessments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No Assessments Yet
              </Text>

              <Text style={styles.emptyText}>
                Create an assessment for one of your
                job positions.
              </Text>
            </View>
          ) : (
            assessments.map((assessment) => {
              const published =
                isPublished(assessment);

              const isDeleting =
                deletingId === assessment._id;

              const isPublishing =
                publishingId === assessment._id;

              const isSaving =
                savingId === assessment._id;

              return (
                <View
                  key={assessment._id}
                  style={styles.assessmentCard}
                >
                  <View style={styles.headerRow}>
                    <Text
                      style={styles.assessmentTitle}
                    >
                      {assessment.title}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        published
                          ? styles.publishedBadge
                          : styles.draftBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          published
                            ? styles.publishedText
                            : styles.draftText,
                        ]}
                      >
                        {published
                          ? 'Published'
                          : 'Draft'}
                      </Text>
                    </View>
                  </View>

                  {assessment.description ? (
                    <Text style={styles.description}>
                      {assessment.description}
                    </Text>
                  ) : null}

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Questions
                    </Text>

                    <Text style={styles.infoValue}>
                      {assessment.questions?.length ||
                        0}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Duration
                    </Text>

                    <Text style={styles.infoValue}>
                      {assessment.duration} minutes
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Passing Score
                    </Text>

                    <Text style={styles.infoValue}>
                      {assessment.passingScore}%
                    </Text>
                  </View>

                  {!published ? (
                    <TouchableOpacity
                      style={[
                        styles.publishButton,
                        isPublishing &&
                          styles.disabledButton,
                      ]}
                      onPress={() =>
                        publishAssessment(
                          assessment._id
                        )
                      }
                      disabled={
                        isPublishing ||
                        isDeleting ||
                        isSaving
                      }
                    >
                      <Text
                        style={
                          styles.publishButtonText
                        }
                      >
                        {isPublishing
                          ? 'Publishing...'
                          : 'Publish Assessment'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={styles.publishedMessage}
                    >
                      <Text
                        style={
                          styles.publishedMessageText
                        }
                      >
                        ✓ This assessment is available
                        to candidates
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      isSaving &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      openEditAssessment(
                        assessment
                      )
                    }
                    disabled={
                      isDeleting ||
                      isPublishing ||
                      isSaving
                    }
                  >
                    <Text
                      style={styles.editButtonText}
                    >
                      {isSaving
                        ? 'Saving...'
                        : 'Edit Assessment'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      (isDeleting ||
                        isPublishing ||
                        isSaving) &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      deleteAssessment(
                        assessment._id
                      )
                    }
                    disabled={
                      isDeleting ||
                      isPublishing ||
                      isSaving
                    }
                  >
                    <Text
                      style={styles.deleteButtonText}
                    >
                      {isDeleting
                        ? 'Deleting...'
                        : 'Delete Assessment'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

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

      <Modal
        visible={editingAssessment !== null}
        animationType="slide"
        onRequestClose={() =>
          setEditingAssessment(null)
        }
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={
              styles.modalContent
            }
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalTitle}>
              Edit Assessment
            </Text>

            <Text style={styles.inputLabel}>
              Assessment Title
            </Text>

            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Assessment title"
              placeholderTextColor="#999999"
            />

            <Text style={styles.inputLabel}>
              Description
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Assessment description"
              placeholderTextColor="#999999"
              multiline
            />

            <Text style={styles.inputLabel}>
              Duration (minutes)
            </Text>

            <TextInput
              style={styles.input}
              value={editDuration}
              onChangeText={setEditDuration}
              placeholder="30"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>
              Passing Score (%)
            </Text>

            <TextInput
              style={styles.input}
              value={editPassingScore}
              onChangeText={setEditPassingScore}
              placeholder="60"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />

            <Text style={styles.questionsHeading}>
              Questions
            </Text>

            {editQuestions.map(
              (question, questionIndex) => (
                <View
                  key={questionIndex}
                  style={styles.questionEditor}
                >
                  <Text
                    style={styles.questionNumber}
                  >
                    Question {questionIndex + 1}
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                    ]}
                    value={question.question}
                    onChangeText={(value) =>
                      updateQuestionText(
                        questionIndex,
                        value
                      )
                    }
                    placeholder="Question"
                    placeholderTextColor="#999999"
                    multiline
                  />

                  <Text style={styles.optionHeading}>
                    Options
                  </Text>

                  {question.options.map(
                    (option, optionIndex) => {
                      const isCorrect =
                        question.correctAnswer ===
                        option;

                      return (
                        <View
                          key={optionIndex}
                          style={styles.optionRow}
                        >
                          <TextInput
                            style={[
                              styles.optionInput,
                              isCorrect &&
                                styles.correctOptionInput,
                            ]}
                            value={option}
                            onChangeText={(value) =>
                              updateOptionText(
                                questionIndex,
                                optionIndex,
                                value
                              )
                            }
                            placeholder={`Option ${
                              optionIndex + 1
                            }`}
                            placeholderTextColor="#999999"
                          />

                          <TouchableOpacity
                            style={[
                              styles.correctButton,
                              isCorrect &&
                                styles.correctButtonActive,
                            ]}
                            onPress={() =>
                              setCorrectAnswer(
                                questionIndex,
                                option
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.correctButtonText,
                                isCorrect &&
                                  styles.correctButtonTextActive,
                              ]}
                            >
                              {isCorrect
                                ? 'Correct ✓'
                                : 'Correct'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }
                  )}

                  <Text style={styles.pointsText}>
                    Points: {question.points || 1}
                  </Text>
                </View>
              )
            )}

            <TouchableOpacity
              style={[
                styles.saveButton,
                savingId &&
                  styles.disabledButton,
              ]}
              onPress={saveAssessment}
              disabled={savingId !== null}
            >
              <Text style={styles.saveButtonText}>
                {savingId
                  ? 'Saving Assessment...'
                  : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                setEditingAssessment(null)
              }
              disabled={savingId !== null}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
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

  createButton: {
    backgroundColor: '#5b4ee8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  section: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#202020',
    marginBottom: 15,
  },

  emptyCard: {
    backgroundColor: '#f7f7f9',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },

  assessmentCard: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },

  assessmentTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  publishedBadge: {
    backgroundColor: '#e8f7ee',
  },

  draftBadge: {
    backgroundColor: '#fff4df',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  publishedText: {
    color: '#218642',
  },

  draftText: {
    color: '#b36b00',
  },

  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },

  publishButton: {
    backgroundColor: '#218642',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 15,
  },

  publishButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  editButton: {
    backgroundColor: '#5b4ee8',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 10,
  },

  editButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  deleteButton: {
    backgroundColor: '#d93636',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 10,
  },

  deleteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  publishedMessage: {
    backgroundColor: '#e8f7ee',
    padding: 12,
    borderRadius: 9,
    marginTop: 15,
  },

  publishedMessageText: {
    color: '#218642',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 20,
  },

  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  modalContent: {
    padding: 20,
    paddingBottom: 50,
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#202020',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222222',
  },

  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  questionsHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#202020',
    marginTop: 28,
    marginBottom: 15,
  },

  questionEditor: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
  },

  questionNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },

  optionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginTop: 15,
    marginBottom: 8,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  optionInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222222',
  },

  correctOptionInput: {
    borderColor: '#218642',
  },

  correctButton: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },

  correctButtonActive: {
    backgroundColor: '#e8f7ee',
    borderColor: '#218642',
  },

  correctButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
  },

  correctButtonTextActive: {
    color: '#218642',
  },

  pointsText: {
    fontSize: 13,
    color: '#777777',
    marginTop: 5,
  },

  saveButton: {
    backgroundColor: '#218642',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 10,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  cancelButton: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 10,
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});