import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RedirectToNewOnboarding() {
  useEffect(() => {
    router.replace('/onboarding/emotion-select');
  }, []);
  return null;
}
