import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { colors } = useTheme();

  const handleGetStarted = () => {
    router.replace('/onboarding/name');
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
      textAlign: 'center',
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
      backgroundColor: colors.accentSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    getStartedButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 64,
      paddingVertical: 16,
      borderRadius: 16,
      
    },
    getStartedText: {
      fontSize: 16,
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