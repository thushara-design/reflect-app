import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Check } from 'lucide-react-native';

const COMMON_EMOTIONS = [
  { name: 'Anxiety', emoji: '😰', color: '#FF9F43' },
  { name: 'Sadness', emoji: '😢', color: '#74B9FF' },
  { name: 'Anger', emoji: '😠', color: '#FF6B6B' },
  { name: 'Guilt', emoji: '😔', color: '#A29BFE' },
  { name: 'Stress', emoji: '😫', color: '#FD79A8' },
  { name: 'Loneliness', emoji: '😞', color: '#FDCB6E' },
  { name: 'Numbness', emoji: '😶', color: '#B2BEC3' },
];

export default function EmotionSelectScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const { colors } = useTheme();
  const { completeOnboarding } = useOnboarding();

  const toggleEmotion = (emotion: string) => {
    setSelected(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
  };

  const handleNext = () => {
    if (selected.length > 0) {
      router.push({ pathname: '/onboarding/emotion-activities', params: { emotions: JSON.stringify(selected) } } as any);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const progress = selected.length / COMMON_EMOTIONS.length;
  const dynamicStyles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 16,
    },
    stepIndicator: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 0 },
    skip: { color: colors.primary, fontWeight: '400', fontSize: 16, padding: 8, textAlign: 'center' },
    title: { fontSize: 24, fontWeight: '300', color: colors.text, textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 18, lineHeight: 22 },
    emotionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    emotionCard: {
      width: '30%',
      aspectRatio: 0.85,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      marginTop: 2,
      position: 'relative',
      minHeight: 80,
      maxHeight: 110,
    },
    emotionCardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.primary + '18',
    },
    checkOverlay: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 2,
      zIndex: 2,
    },
    emotionEmoji: { fontSize: 28, marginBottom: 4 },
    emotionName: { fontSize: 13, color: colors.text, fontWeight: '400', textAlign: 'center' },
    nextButtonContainer: {
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
    },
    nextButton: {
      backgroundColor: selected.length > 0 ? colors.primary : colors.border,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    nextButtonText: { color: '#fff', fontWeight: '400', fontSize: 16 },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <View style={dynamicStyles.header}>
        <View style={{ width: 24 }} />
        <Text style={dynamicStyles.stepIndicator}>Step 2 of 2</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.title}>Which emotions do you struggle with most?</Text>
        <Text style={dynamicStyles.subtitle}>Select all that apply. You can add more later.</Text>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.emotionsGrid}>
            {COMMON_EMOTIONS.map((emotion) => {
              const isSelected = selected.includes(emotion.name);
              return (
                <TouchableOpacity
                  key={emotion.name}
                  style={[
                    dynamicStyles.emotionCard,
                    isSelected && dynamicStyles.emotionCardSelected,
                  ]}
                  onPress={() => toggleEmotion(emotion.name)}
                  activeOpacity={0.85}
                >
                  {isSelected && (
                    <View style={dynamicStyles.checkOverlay}>
                      <Check size={14} color="#fff" strokeWidth={2} />
                    </View>
                  )}
                  <Text style={dynamicStyles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={dynamicStyles.emotionName}>{emotion.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={dynamicStyles.nextButtonContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={dynamicStyles.skip}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.nextButton}
          onPress={handleNext}
          disabled={selected.length === 0}
        >
          <Text style={dynamicStyles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}