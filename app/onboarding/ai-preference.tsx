import { View, Text, StyleSheet, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Brain, Sparkles, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function AIPreferenceScreen() {
  const { colors } = useTheme();
  const { updateAIPreference, userProfile, isLoading } = useOnboarding();

  const handleNext = async () => {
    if (!userProfile) return;
    await updateAIPreference(userProfile.useAI);
    router.push('/onboarding/emotion-select');
  };

  const handleBack = () => {
    router.back();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
      fontFamily: 'Nunito-Regular',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '300',
      color: '#181818',
      textAlign: 'center',
      marginBottom: 16,
      letterSpacing: -0.5,
      fontFamily: 'Nunito-Bold',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 60,
      lineHeight: 24,
      fontFamily: 'Nunito-Regular',
    },
    aiCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 24,
      marginBottom: 32,
    },
    aiCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    aiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    aiIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    aiIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiTitle: {
      fontSize: 20,
      fontWeight: '400',
      color: '#181818',
      fontFamily: 'Nunito-Bold',
    },
    featuresList: {
      gap: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      color: '#181818',
      lineHeight: 20,
      fontFamily: 'Nunito-Regular',
    },
    fallbackInfo: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 40,
    },
    fallbackTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: '#181818',
      marginBottom: 8,
      fontFamily: 'Nunito-Bold',
    },
    fallbackText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontFamily: 'Nunito-Regular',
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    nextButtonText: {
      fontSize: 16,
      color: colors.background,
      fontWeight: '400',
      fontFamily: 'Nunito-Bold',
    },
  });

  const aiFeatures = [
    {
      icon: Brain,
      text: 'Emotion detection and analysis from your writing'
    },
    {
      icon: Sparkles,
      text: 'Identify unhelpful thinking patterns and suggest reframes'
    },
    {
      icon: Activity,
      text: 'Personalized activity suggestions based on your mood'
    }
  ];

  // Only render after userProfile/isLoading are ready
  if (isLoading || !userProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const useAI = userProfile.useAI;

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={dynamicStyles.stepIndicator}>Step 2 of 3</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Use AI features?</Text>
        <Text style={dynamicStyles.subtitle}>
          AI can help analyze your emotions and suggest personalized coping strategies
        </Text>

        <TouchableOpacity 
          style={[dynamicStyles.aiCard, useAI && dynamicStyles.aiCardActive]}
          onPress={() => updateAIPreference(!useAI)}
          activeOpacity={0.8}
        >
          <View style={dynamicStyles.aiHeader}>
            <View style={dynamicStyles.aiIconContainer}>
              <View style={dynamicStyles.aiIcon}>
                <Brain size={24} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={dynamicStyles.aiTitle}>AI Analysis</Text>
            </View>
            <Switch
              value={useAI}
              onValueChange={() => updateAIPreference(!useAI)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {useAI && (
            <View style={dynamicStyles.featuresList}>
              {aiFeatures.map((feature, index) => (
                <View key={index} style={dynamicStyles.featureItem}>
                  <View style={dynamicStyles.featureIcon}>
                    <feature.icon size={16} color={colors.primary} strokeWidth={1.5} />
                  </View>
                  <Text style={dynamicStyles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {!useAI && (
          <View style={dynamicStyles.fallbackInfo}>
            <Text style={dynamicStyles.fallbackTitle}>Without AI, you'll still get:</Text>
            <Text style={dynamicStyles.fallbackText}>
              • Your personalized coping activities{'\n'}
              • Basic emotion tracking{'\n'}
              • All journaling features{'\n'}
              • Complete privacy - no data processing
            </Text>
          </View>
        )}

        <TouchableOpacity style={dynamicStyles.nextButton} onPress={handleNext}>
          <Text style={dynamicStyles.nextButtonText}>Continue</Text>
          <ArrowRight size={20} color={colors.background} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: 24,
  },
});