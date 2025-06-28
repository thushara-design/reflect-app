import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import React from 'react';
import { router } from 'expo-router';
import { Brain } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

function AIPreferenceScreen() {
  const { colors } = useTheme();
  const { updateAIPreference, userProfile, isLoading } = useOnboarding();
  
  const [useAI, setUseAI] = useState(true);

  const handleNext = useCallback(async () => {
    if (!userProfile) return;
    await updateAIPreference(useAI);
    router.replace('/onboarding/emotion-select');
  }, [userProfile, useAI, updateAIPreference]);

  const handleCardPress = useCallback(() => {
    setUseAI(!useAI);
  }, [useAI]);

  if (isLoading || userProfile?.useAI === undefined) {
    console.log('[RENDER] Loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('[RENDER] Main component');

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 24, 
      paddingTop: 50, 
      paddingBottom: 16 
    },
    stepIndicator: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    title: { 
      fontSize: 32, 
      fontWeight: '300', 
      color: colors.primary, 
      marginBottom: 16 
    },
    subtitle: { 
      fontSize: 18, 
      color: colors.textSecondary, 
      marginBottom: 60 
    },
    card: { 
      backgroundColor: colors.background, 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 12, 
      padding: 24, 
      marginBottom: 32
    },
    cardHeader: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginBottom: 20 
    },
    cardLeft: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 12 
    },
    iconContainer: { 
      width: 48, 
      height: 48, 
      borderRadius: 16, 
      backgroundColor: colors.primary + '20', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    cardTitle: { 
      fontSize: 20, 
      fontWeight: '400',
      color: colors.text,
    },
    toggleContainer: {
      width: 51,
      height: 31,
      borderRadius: 15.5,
      backgroundColor: useAI ? colors.primary : colors.border,
      padding: 2,
      justifyContent: 'center',
    },
    toggleThumb: {
      width: 27,
      height: 27,
      borderRadius: 13.5,
      backgroundColor: colors.background,
      transform: [{ translateX: useAI ? 20 : 0 }],
    },
    description: { 
      fontSize: 14, 
      color: colors.textSecondary, 
      marginBottom: 40, 
      lineHeight: 20 
    },
    nextButton: { 
      backgroundColor: colors.primary, 
      paddingVertical: 16, 
      borderRadius: 16, 
      alignItems: 'center' 
    },
    nextButtonText: { 
      fontSize: 16, 
      color: colors.background,
      fontWeight: '400',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={{ width: 24 }} />
        <Text style={dynamicStyles.stepIndicator}>Step 2 of 3</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Use AI features?</Text>
        <Text style={dynamicStyles.subtitle}>
          AI can help analyze your emotions and suggest personalized coping strategies
        </Text>

        <TouchableOpacity 
          style={dynamicStyles.card}
          onPress={handleCardPress}
        >
          <View style={dynamicStyles.cardHeader}>
            <View style={dynamicStyles.cardLeft}>
              <View style={dynamicStyles.iconContainer}>
                <Brain size={24} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={dynamicStyles.cardTitle}>AI Reflection</Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.toggleContainer}
              onPress={handleCardPress}
              activeOpacity={0.8}
            >
              <View style={dynamicStyles.toggleThumb} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <Text style={dynamicStyles.description}>
          {useAI 
            ? "With AI, you get deep insights like cognitive distortion detection, personalized reframes, and voice-to-text transcription."
            : "Without AI, you still get core features like basic emotion tracking and your coping toolkit — all running locally, with full privacy and no data ever leaving your device."
          }
        </Text>

        <TouchableOpacity 
          style={dynamicStyles.nextButton} 
          onPress={handleNext}
        >
          <Text style={dynamicStyles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AIPreferenceScreen;
