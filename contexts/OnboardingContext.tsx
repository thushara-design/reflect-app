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
  useAI: boolean; // New field for AI preference
}

interface OnboardingContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  updateUserName: (name: string) => Promise<void>;
  updateAIPreference: (useAI: boolean) => Promise<void>; // New method
  updateEmotionalToolkit: (toolkit: EmotionalToolkitItem[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = '@reflect_user_profile';

const defaultProfile: UserProfile = {
  name: '',
  emotionalToolkit: [],
  hasCompletedOnboarding: false,
  useAI: true, // Default to true for better experience
};

// Utility to capitalize first letter
function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function mergeToolkit(oldToolkit: EmotionalToolkitItem[], newToolkit: EmotionalToolkitItem[]): EmotionalToolkitItem[] {
  const mergedMap = new Map<string, string[]>();

  // First, add old data
  oldToolkit.forEach(item => mergedMap.set(capitalizeFirst(item.emotion), item.actions));

  // Then, override with new data
  newToolkit.forEach(item => mergedMap.set(capitalizeFirst(item.emotion), item.actions));

  return Array.from(mergedMap.entries()).map(([emotion, actions]) => ({ emotion, actions }));
}

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
        const profile = JSON.parse(stored);
        // Ensure useAI field exists for existing users
        if (profile.useAI === undefined) {
          profile.useAI = true;
        }
        setUserProfile(profile);
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

  const updateAIPreference = async (useAI: boolean) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, useAI };
    await saveUserProfile(updatedProfile);
  };

  const updateEmotionalToolkit = async (toolkit: EmotionalToolkitItem[]) => {
    if (!userProfile) return;
    const updatedProfile: UserProfile = {
      name: userProfile.name || '',
      emotionalToolkit: mergeToolkit(userProfile.emotionalToolkit || [], toolkit),
      hasCompletedOnboarding: userProfile.hasCompletedOnboarding ?? false,
      useAI: userProfile.useAI ?? true,
    };

    console.log('DEBUG: Saving toolkit inside context function:', updatedProfile.emotionalToolkit);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    console.log('DEBUG: Saved to AsyncStorage');

    setUserProfile(updatedProfile); // Ensure in-memory state is updated after save
    console.log('DEBUG: setUserProfile called after saving', updatedProfile);
  };

  const completeOnboarding = async () => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, hasCompletedOnboarding: true };
    await saveUserProfile(updatedProfile);
  };

  const resetOnboarding = async () => {
    await saveUserProfile(defaultProfile);
  };

  useEffect(() => {
    AsyncStorage.getItem('@reflect_user_profile').then(json => {
      if (json) {
        const parsed = JSON.parse(json);
        console.log('DEBUG: Fetched from AsyncStorage again:', parsed);
        if (parsed) {
          setUserProfile(parsed);
        }
      }
    });
  }, []);

  return (
    <OnboardingContext.Provider value={{
      userProfile,
      isLoading,
      updateUserName,
      updateAIPreference,
      updateEmotionalToolkit,
      completeOnboarding,
      resetOnboarding,
      setUserProfile,
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