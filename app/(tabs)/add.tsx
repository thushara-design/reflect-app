import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Plus, Mic, CreditCard as Edit3 } from 'lucide-react-native';
import TopNavBar from '@/components/TopNavBar';

export default function AddTab() {
  const prompts = [
    "What made you smile today?",
    "Describe a moment of peace you experienced",
    "What are you grateful for right now?",
    "How did you grow today?",
    "What challenged you and how did you respond?",
  ];

  const handleNewEntry = () => {
    router.push('/new-entry');
  };

  const handlePromptSelect = (prompt: string) => {
    router.push({
      pathname: '/new-entry',
      params: { prompt }
    });
  };

  return (
    <View style={styles.container}>
      <TopNavBar title="New Entry" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling today?</Text>
        </View>

        {/* Quick Start */}
        <View style={styles.quickStartSection}>
          <TouchableOpacity style={styles.newEntryButton} onPress={handleNewEntry}>
            <Plus size={24} color="#FAFAFA" strokeWidth={1.5} />
            <Text style={styles.newEntryText}>New Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Input Methods */}
        <View style={styles.inputMethodsContainer}>
          <TouchableOpacity style={styles.inputMethod} onPress={handleNewEntry}>
            <Mic size={24} color="#A5B8C8" strokeWidth={1.5} />
            <Text style={styles.inputMethodText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputMethod} onPress={handleNewEntry}>
            <Edit3 size={24} color="#A5B8C8" strokeWidth={1.5} />
            <Text style={styles.inputMethodText}>Write</Text>
          </TouchableOpacity>
        </View>

        {/* Writing Prompts */}
        <View style={styles.promptsSection}>
          <Text style={styles.sectionTitle}>Writing Prompts</Text>
          <View style={styles.promptsGrid}>
            {prompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptCard}
                onPress={() => handlePromptSelect(prompt)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2A2A2A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  quickStartSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A5B8C8',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  newEntryText: {
    fontSize: 16,
    color: '#FAFAFA',
    fontWeight: '400',
  },
  inputMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  inputMethod: {
    alignItems: 'center',
    gap: 8,
  },
  inputMethodText: {
    fontSize: 12,
    color: '#A5B8C8',
    fontWeight: '300',
  },
  promptsSection: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2A2A2A',
    marginBottom: 16,
  },
  promptsGrid: {
    gap: 12,
  },
  promptCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 20,
  },
  promptText: {
    fontSize: 15,
    color: '#2A2A2A',
    fontWeight: '300',
    lineHeight: 22,
  },
});