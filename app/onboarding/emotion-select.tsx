import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Check } from 'lucide-react-native';
import { COMMON_EMOTIONS } from './emotions';
import OpenMojiIcon from '@/components/OpenMojiIcon';

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

  const dynamicStyles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 16,
    },
    skip: { color: colors.textSecondary, fontWeight: '600', fontSize: 16, padding: 8, textAlign: 'center' },
    title: { fontSize: 28, fontWeight: '300', color: '#181818', textAlign: 'left', marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'left', marginBottom: 30, lineHeight: 24 },
    stepIndicator: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
      textAlign: 'left',
      marginBottom: 20,
    },
    emotionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
    emotionCard: {
      width: '47%',
      aspectRatio: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      marginTop: 2,
      position: 'relative',
    },
    emotionCardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.primary + '18',
    },
    checkOverlay: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 2,
      zIndex: 2,
    },
    emotionEmoji: { fontSize: 38, marginBottom: 10 },
    emotionName: { fontSize: 16, color: '#181818', fontWeight: '500', textAlign: 'left' },
    nextButtonContainer: {
      paddingBottom: 24,
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    nextButton: {
      backgroundColor: selected.length > 0 ? colors.primary : colors.border,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      marginTop: 8,
    },
    nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  });

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <View style={{ width: 24 }} />
          <Text style={dynamicStyles.stepIndicator}>Step 3 of 3</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={dynamicStyles.title}>Which emotions do you struggle with most?</Text>
        <Text style={dynamicStyles.subtitle}>Select all that apply. You can add more later.</Text>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.emotionsGrid}>
            {COMMON_EMOTIONS.map((emotion: { name: string; emoji: string; color: string }) => {
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
                      <Check size={18} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                  <OpenMojiIcon 
                    uri={emotion.emoji}
                    width={38}
                    height={38}
                  />
                  <Text style={dynamicStyles.emotionName}>{emotion.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={dynamicStyles.nextButtonContainer}>
        <TouchableOpacity
          style={dynamicStyles.nextButton}
          onPress={handleNext}
          disabled={selected.length === 0}
        >
          <Text style={dynamicStyles.nextButtonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} style={{ marginTop: 12, alignSelf: 'center' }}>
          <Text style={dynamicStyles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}