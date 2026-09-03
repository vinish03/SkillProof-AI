import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

type Assessment = {
  _id: string;
  jobId: string;
  title: string;
  description?: string;
  duration: number;
  passingScore: number;
  questions: Question[];
  status: string;
};

type Answer = {
  questionIndex: number;
  selectedAnswer: string;
};

export default function Assessment() {
  const { jobId } = useLocalSearchParams<{
    jobId?: string;
  }>();

  const [assessment, setAssessment] =
    useState<Assessment | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    loadAssessment();
  }, [jobId]);

  useEffect(() => {
    if (!assessment || finished || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, finished, timeLeft]);

  const loadAssessment = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/assessments/published`
      );

      const data = await response.json();

      console.log(
        'PUBLISHED ASSESSMENTS STATUS:',
        response.status
      );

      console.log(
        'PUBLISHED ASSESSMENTS RESPONSE:',
        data
      );

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Could not load assessment.'
        );
        return;
      }

      if (
        !Array.isArray(data.assessments) ||
        data.assessments.length === 0
      ) {
        Alert.alert(
          'No Assessment Available',
          'There are no published assessments available right now.'
        );
        return;
      }

      let selectedAssessment = data.assessments[0];

      if (jobId) {
        const matchingAssessment =
          data.assessments.find(
            (item: Assessment) =>
              item.jobId?.toString() === jobId.toString()
          );

        if (!matchingAssessment) {
          Alert.alert(
            'Assessment Not Available',
            'There is no published assessment available for this job.'
          );
          setAssessment(null);
          return;
        }

        selectedAssessment = matchingAssessment;
      }

      setAssessment(selectedAssessment);
      setTimeLeft(selectedAssessment.duration * 60);
    } catch (error) {
      console.error(
        'Load assessment error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Could not connect to the SkillProof AI server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const saveResult = async (
    finalAnswers: Answer[],
    finalScore: number
  ) => {
    if (!assessment) {
      return;
    }

    try {
      setSavingResult(true);

      const candidateId =
        await AsyncStorage.getItem('candidateId');

      console.log('CANDIDATE ID:', candidateId);

      if (!candidateId) {
        Alert.alert(
          'Error',
          'Candidate information was not found. Please log in again.'
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/assessments/${assessment._id}/result`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateId,
            answers: finalAnswers,
          }),
        }
      );

      const data = await response.json();

      console.log(
        'SAVE RESULT STATUS:',
        response.status
      );

      console.log(
        'SAVE RESULT RESPONSE:',
        data
      );

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Could not save assessment result.'
        );
        return;
      }

      setScore(
        data.result?.score ?? finalScore
      );

      setFinished(true);
    } catch (error) {
      console.error(
        'Save assessment result error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Could not save your assessment result.'
      );
    } finally {
      setSavingResult(false);
    }
  };

  useEffect(() => {
    if (
      !assessment ||
      finished ||
      savingResult ||
      timeLeft !== 0
    ) {
      return;
    }

    Alert.alert(
      'Time Up',
      'Your assessment time has ended. Your answers will be submitted automatically.'
    );

    saveResult(answers, score);
  }, [
    assessment,
    finished,
    savingResult,
    timeLeft,
    answers,
    score,
  ]);

  const nextQuestion = () => {
    if (!selectedAnswer) {
      Alert.alert(
        'Select an answer',
        'Please select an answer before continuing.'
      );
      return;
    }

    if (!assessment) {
      return;
    }

    const question =
      assessment.questions[currentQuestion];

    const answerIsCorrect =
      selectedAnswer === question.correctAnswer;

    const newScore = answerIsCorrect
      ? score + question.points
      : score;

    const updatedAnswers = [
      ...answers.filter(
        (answer) =>
          answer.questionIndex !== currentQuestion
      ),
      {
        questionIndex: currentQuestion,
        selectedAnswer,
      },
    ];

    setAnswers(updatedAnswers);

    if (answerIsCorrect) {
      setScore(newScore);
    }

    if (
      currentQuestion ===
      assessment.questions.length - 1
    ) {
      setScore(newScore);
      saveResult(updatedAnswers, newScore);
      return;
    }

    setCurrentQuestion(
      (previous) => previous + 1
    );

    setSelectedAnswer('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#5b4ee8"
        />

        <Text style={styles.loadingText}>
          Loading assessment...
        </Text>
      </View>
    );
  }

  if (!assessment) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>
          No Assessment Available
        </Text>

        <Text style={styles.resultText}>
          Please check again later for a published
          assessment.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.replace('/candidate-dashboard')
          }
        >
          <Text style={styles.buttonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const totalPoints =
      assessment.questions.reduce(
        (total, question) =>
          total + question.points,
        0
      );

    const percentage =
      totalPoints > 0
        ? Math.round(
            (score / totalPoints) * 100
          )
        : 0;

    const passed =
      percentage >= assessment.passingScore;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>
          Assessment Completed
        </Text>

        <Text style={styles.assessmentTitle}>
          {assessment.title}
        </Text>

        <Text style={styles.resultScore}>
          {percentage}%
        </Text>

        <Text style={styles.resultText}>
          Score: {score} / {totalPoints}
        </Text>

        <Text
          style={[
            styles.resultStatus,
            passed
              ? styles.passedText
              : styles.failedText,
          ]}
        >
          {passed ? 'Passed' : 'Not Passed'}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.replace('/candidate-dashboard')
          }
        >
          <Text style={styles.buttonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question =
    assessment.questions[currentQuestion];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        {assessment.title}
      </Text>

      <Text style={styles.subtitle}>
        {assessment.description ||
          'Complete the technical assessment'}
      </Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of{' '}
          {assessment.questions.length}
        </Text>

        <Text style={styles.timerText}>
          Time Left: {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.question}>
          {question.question}
        </Text>

        {question.options.map(
          (option, index) => {
            const selected =
              selectedAnswer === option;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  selected &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  selectAnswer(option)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    selected &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          savingResult && styles.disabledButton,
        ]}
        onPress={nextQuestion}
        disabled={savingResult}
      >
        <Text style={styles.buttonText}>
          {savingResult
            ? 'Saving Result...'
            : currentQuestion ===
                assessment.questions.length - 1
              ? 'Submit Assessment'
              : 'Next Question'}
        </Text>
      </TouchableOpacity>

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
    fontSize: 15,
    color: '#666666',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1f1f1f',
    marginTop: 25,
  },

  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  progressCard: {
    backgroundColor: '#eeecff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },

  progressText: {
    textAlign: 'center',
    color: '#5b4ee8',
    fontWeight: '700',
  },

  timerText: {
    textAlign: 'center',
    color: '#c62828',
    fontWeight: '700',
    marginTop: 8,
    fontSize: 16,
  },

  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },

  question: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
    lineHeight: 27,
    marginBottom: 20,
  },

  option: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },

  selectedOption: {
    backgroundColor: '#eeecff',
    borderColor: '#5b4ee8',
  },

  optionText: {
    fontSize: 15,
    color: '#444444',
  },

  selectedOptionText: {
    color: '#5b4ee8',
    fontWeight: '700',
  },

  button: {
    backgroundColor: '#5b4ee8',
    padding: 16,
    borderRadius: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },

  backButton: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },

  backButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },

  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f6fa',
  },

  resultTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
  },

  assessmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444444',
    textAlign: 'center',
    marginTop: 15,
  },

  resultScore: {
    fontSize: 52,
    fontWeight: '800',
    color: '#5b4ee8',
    marginTop: 20,
  },

  resultText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  resultStatus: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 30,
  },

  passedText: {
    color: '#16803c',
  },

  failedText: {
    color: '#c62828',
  },
});