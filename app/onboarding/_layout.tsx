import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="ai-preference" />
      <Stack.Screen name="emotion-select" />
      <Stack.Screen name="emotion-activities" />
    </Stack>
  );
}