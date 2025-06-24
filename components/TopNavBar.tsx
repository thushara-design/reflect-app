import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Menu, Moon, LogOut } from 'lucide-react-native';

interface TopNavBarProps {
  title: string;
  showDarkMode?: boolean;
  showSignOut?: boolean;
}

export default function TopNavBar({ title, showDarkMode = false, showSignOut = false }: TopNavBarProps) {
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    console.log('Sign out pressed');
  };

  return (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.navButton}>
        <Menu size={20} color="#2A2A2A" strokeWidth={1.5} />
      </TouchableOpacity>
      
      <Text style={styles.navTitle}>{title}</Text>
      
      <View style={styles.navActions}>
        {showDarkMode && (
          <View style={styles.darkModeToggle}>
            <Moon size={16} color={darkMode ? "#A5B8C8" : "#EAEAEA"} strokeWidth={1.5} />
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#EAEAEA', true: '#A5B8C8' }}
              thumbColor={darkMode ? '#FAFAFA' : '#FAFAFA'}
              style={styles.switch}
            />
          </View>
        )}
        
        {showSignOut && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={18} color="#EFCFD6" strokeWidth={1.5} />
          </TouchableOpacity>
        )}
        
        {!showDarkMode && !showSignOut && <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2A2A2A',
    letterSpacing: -0.3,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFCFD6' + '20',
  },
  placeholder: {
    width: 20,
  },
});