import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { PenTool } from 'lucide-react-native';
import TopNavBar from '@/components/TopNavBar';

export default function AddTab() {
  const handleNewEntry = () => {
    router.push('/new-entry');
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
            <PenTool size={24} color="#FAFAFA" strokeWidth={1.5} />
            <Text style={styles.newEntryText}>Start Writing</Text>
          </TouchableOpacity>
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
    paddingVertical: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#222',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: 'Nunito-Regular',
  },
  quickStartSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A5B8C8',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newEntryText: {
    fontSize: 18,
    color: '#FAFAFA',
    fontWeight: '400',
    fontFamily: 'Nunito-Regular',
  },
});