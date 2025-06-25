import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  accent: string;
  error: string;
}

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FAFAFA',
  text: '#2A2A2A',
  textSecondary: '#A5B8C8',
  border: '#EAEAEA',
  primary: '#A5B8C8',
  accent: '#EFCFD6',
  error: '#FF6B6B',
};

const darkColors: ThemeColors = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: '#FAFAFA',
  textSecondary: '#A5B8C8',
  border: '#3A3A3A',
  primary: '#A5B8C8',
  accent: '#EFCFD6',
  error: '#FF6B6B',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // const systemColorScheme = useColorScheme();
  // const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const isDark = false; // Always light mode

  const colors = lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}