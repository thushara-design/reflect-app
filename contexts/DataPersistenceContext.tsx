import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEntries } from './EntriesContext';
import { useOnboarding } from './OnboardingContext';

interface DataPersistenceContextType {
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const DataPersistenceContext = createContext<DataPersistenceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENTRIES: '@reflect_entries',
  USER_PROFILE: '@reflect_user_profile',
  THEME_PREFERENCE: '@reflect_theme',
  APP_SETTINGS: '@reflect_settings',
};

export function DataPersistenceProvider({ children }: { children: ReactNode }) {
  const { entries, addEntry } = useEntries();
  const { userProfile } = useOnboarding();

  // Auto-save entries when they change
  useEffect(() => {
    const saveEntries = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
      } catch (error) {
        console.error('Failed to save entries:', error);
      }
    };

    if (entries.length > 0) {
      saveEntries();
    }
  }, [entries]);

  const exportData = async (): Promise<string> => {
    try {
      const allData = {
        entries: await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES),
        userProfile: await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        themePreference: await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE),
        appSettings: await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  };

  const importData = async (data: string): Promise<void> => {
    try {
      const parsedData = JSON.parse(data);
      
      // Validate data structure
      if (!parsedData.version || !parsedData.exportDate) {
        throw new Error('Invalid data format');
      }

      // Import each data type
      if (parsedData.entries) {
        await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, parsedData.entries);
      }
      if (parsedData.userProfile) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, parsedData.userProfile);
      }
      if (parsedData.themePreference) {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, parsedData.themePreference);
      }
      if (parsedData.appSettings) {
        await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, parsedData.appSettings);
      }

      // Reload the app to reflect changes
      // Note: In a real app, you might want to trigger context updates instead
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data');
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ENTRIES,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.THEME_PREFERENCE,
        STORAGE_KEYS.APP_SETTINGS,
      ]);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Failed to clear data');
    }
  };

  return (
    <DataPersistenceContext.Provider value={{
      exportData,
      importData,
      clearAllData,
    }}>
      {children}
    </DataPersistenceContext.Provider>
  );
}

export function useDataPersistence() {
  const context = useContext(DataPersistenceContext);
  if (context === undefined) {
    throw new Error('useDataPersistence must be used within a DataPersistenceProvider');
  }
  return context;
}