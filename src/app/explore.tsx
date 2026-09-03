import { StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkillProof AI</Text>
      <Text style={styles.text}>
        Explore candidate assessments and skill verification.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});