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
  const { isDark, colors } = useTheme();

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
        {showSignOut && (
          <TouchableOpacity style={dynamicStyles.signOutButton} onPress={handleSignOut}>
            <LogOut size={18} color={colors.accent} strokeWidth={1.5} />
          </TouchableOpacity>
        )}
        {!showSignOut && <View style={styles.placeholder} />}
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
  placeholder: {
    width: 20,
  },
});