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
  accentSecondary: string;
  error: string;
}

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#FDFDFD',        // Softer than pure white, reduces glare
  surface: '#FFFFFF',           // True white for cards, modals, elevated surfaces
  text: '#2A2A2A',              // Comfortable dark gray for body text
  textSecondary: '#6B7280',     // Muted blue-gray for secondary info
  border: '#E5E5E5',            // Light neutral gray for soft separation
  primary: '#1C1C1C',           // Desaturated slate blue, soft and neutral
  accent: '#F1F9FF',
  accentSecondary: "#FFF3EC",           // Cool misty blue for gentle accents
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
  accentSecondary: "#EFCFD6",
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