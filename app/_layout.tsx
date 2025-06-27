import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { EntriesProvider } from '@/contexts/EntriesContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  // Remove font loading logic, always set fontsLoaded to true
  const fontsLoaded = true;

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <OnboardingProvider>
        <EntriesProvider>
          <DataPersistenceProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="new-entry" options={{ headerShown: false }} />
              <Stack.Screen name="reflection-results" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </DataPersistenceProvider>
        </EntriesProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}