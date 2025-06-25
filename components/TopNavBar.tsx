import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Menu, Moon, LogOut } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TopNavBarProps {
  title: string;
  showDarkMode?: boolean;
  showSignOut?: boolean;
}

export default function TopNavBar({ title, showDarkMode = false, showSignOut = false }: TopNavBarProps) {
  const { isDark, colors, toggleTheme } = useTheme();

  const handleSignOut = () => {
    console.log('Sign out pressed');
  };

  const dynamicStyles = StyleSheet.create({
    topNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    navTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      letterSpacing: -0.3,
    },
    darkModeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    signOutButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.accent + '20',
    },
  });

  return (
    <View style={dynamicStyles.topNav}>
      <TouchableOpacity style={styles.navButton}>
        <Menu size={20} color={colors.text} strokeWidth={1.5} />
      </TouchableOpacity>
      
      <Text style={dynamicStyles.navTitle}>{title}</Text>
      
      <View style={styles.navActions}>
        {showDarkMode && (
          <View style={dynamicStyles.darkModeToggle}>
            <Moon size={16} color={isDark ? colors.primary : colors.border} strokeWidth={1.5} />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
              style={styles.switch}
            />
          </View>
        )}
        
        {showSignOut && (
          <TouchableOpacity style={dynamicStyles.signOutButton} onPress={handleSignOut}>
            <LogOut size={18} color={colors.accent} strokeWidth={1.5} />
          </TouchableOpacity>
        )}
        
        {!showDarkMode && !showSignOut && <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  placeholder: {
    width: 20,
  },
});