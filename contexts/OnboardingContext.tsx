import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmotionalToolkitItem {
  emotion: string;
  actions: string[];
}

export interface UserProfile {
  name: string;
  emotionalToolkit: EmotionalToolkitItem[];
  hasCompletedOnboarding: boolean;
}

interface OnboardingContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  updateUserName: (name: string) => Promise<void>;
  updateEmotionalToolkit: (toolkit: EmotionalToolkitItem[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = '@reflect_user_profile';

const defaultProfile: UserProfile = {
  name: '',
  emotionalToolkit: [],
  hasCompletedOnboarding: false,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserProfile(JSON.parse(stored));
      } else {
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(defaultProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const updateUserName = async (name: string) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, name };
    await saveUserProfile(updatedProfile);
  };

  const updateEmotionalToolkit = async (toolkit: EmotionalToolkitItem[]) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, emotionalToolkit: toolkit };
    await saveUserProfile(updatedProfile);
  };

  const completeOnboarding = async () => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, hasCompletedOnboarding: true };
    await saveUserProfile(updatedProfile);
  };

  const resetOnboarding = async () => {
    await saveUserProfile(defaultProfile);
  };

  return (
    <OnboardingContext.Provider value={{
      userProfile: userProfile ? { ...userProfile, hasCompletedOnboarding: false } : null,
      isLoading,
      updateUserName,
      updateEmotionalToolkit,
      completeOnboarding,
      resetOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

const { userProfile } = useOnboarding();
const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

const suggestedActivities = selectedEmotion
  ? userProfile?.emotionalToolkit.find(item => item.emotion.toLowerCase() === selectedEmotion.toLowerCase())?.actions || []
  : [];