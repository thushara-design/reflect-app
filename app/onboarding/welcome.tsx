import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { colors } = useTheme();

  const handleGetStarted = () => {
    router.push('/onboarding/name');
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      maxWidth: 320,
    },
    logo: {
      fontSize: 48,
      fontWeight: '300',
      color: colors.text,
      letterSpacing: -1.5,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
      lineHeight: 26,
    },
    illustration: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    getStartedButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    getStartedText: {
      fontSize: 18,
      color: colors.background,
      fontWeight: '400',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.logo}>Reflect</Text>
        <Text style={dynamicStyles.subtitle}>
          Your personal space for mindful reflection and emotional growth
        </Text>
        
        <View style={dynamicStyles.illustration}>
          <Heart size={80} color={colors.primary} strokeWidth={1} />
        </View>

        <TouchableOpacity style={dynamicStyles.getStartedButton} onPress={handleGetStarted}>
          <Text style={dynamicStyles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}