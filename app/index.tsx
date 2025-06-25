import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function IndexScreen() {
  const { userProfile, isLoading } = useOnboarding();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (userProfile?.hasCompletedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding/welcome');
      }
    }
  }, [userProfile, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Loading screen - could add a spinner here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});