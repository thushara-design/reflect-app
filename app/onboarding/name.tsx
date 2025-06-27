import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function NameScreen() {
  const [name, setName] = useState('');
  const { colors } = useTheme();
  const { updateUserName } = useOnboarding();

  const handleNext = async () => {
    if (name.trim()) {
      await updateUserName(name.trim());
      router.push('/onboarding/ai-preference');
    }
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
      fontSize: 30,
      fontWeight: '300',
      color: colors.primary,
      textAlign: 'left',
      marginBottom: 8,
      letterSpacing: -0.5,
      fontFamily: 'Nunito-Bold',
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'left',
      marginBottom: 40,
      lineHeight: 24,
      fontFamily: 'Nunito-Regular',
    },
    inputContainer: {
      marginBottom: 40,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 18,
      color: '#181818',
      textAlign: 'center',
      fontFamily: 'Nunito-Regular',
    },
    inputFocused: {
      borderColor: colors.primary,
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
    nextButtonDisabled: {
      backgroundColor: colors.border,
    },
    nextButtonText: {
      fontSize: 16,
      color: colors.background,
      fontWeight: '400',
      fontFamily: 'Nunito-Bold',
    },
    nextButtonTextDisabled: {
      color: colors.textSecondary,
      fontFamily: 'Nunito-Regular',
    },
  });

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={dynamicStyles.stepIndicator}>Step 1 of 3</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>What should I call you?</Text>
        <Text style={dynamicStyles.subtitle}>
          This helps us personalize your reflection experience
        </Text>

        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={[dynamicStyles.input, name.length > 0 && dynamicStyles.inputFocused]}
            placeholder="Enter your name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleNext}
          />
        </View>

        <TouchableOpacity
          style={[
            dynamicStyles.nextButton,
            !name.trim() && dynamicStyles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={[
            dynamicStyles.nextButtonText,
            !name.trim() && dynamicStyles.nextButtonTextDisabled
          ]}>
            Next
          </Text>
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