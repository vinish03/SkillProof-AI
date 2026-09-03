import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SkillProof AI</Text>

      <Text style={styles.title}>Verify Skills.</Text>
      <Text style={styles.subtitle}>Hire with confidence.</Text>

      <Text style={styles.description}>
        An AI-powered platform to help companies verify candidate skills.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/candidate-login')}
      >
        <Text style={styles.buttonText}>I'm a Candidate</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/company-login')}
      >
        <Text style={styles.buttonText}>I'm a Company</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },

  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 24,
    marginTop: 5,
  },

  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 35,
    color: '#666666',
  },

  button: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#5b4ee8',
    marginTop: 12,
  },

  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});