import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { EntriesProvider } from '@/contexts/EntriesContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <OnboardingProvider>
        <EntriesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="new-entry" options={{ headerShown: false }} />
            <Stack.Screen name="reflection-results" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </EntriesProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}