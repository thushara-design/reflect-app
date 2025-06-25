import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Menu, LogOut, Phone, Palette } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ReflectHeaderProps {
  onMenuPress?: () => void;
}

export default function ReflectHeader({ onMenuPress }: ReflectHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { colors, toggleTheme } = useTheme();

  const handleMenuPress = () => {
    setShowMenu(true);
    onMenuPress?.();
  };

  const handleSignOut = () => {
    setShowMenu(false);
    console.log('Sign out pressed');
  };

  const handleCrisisSupport = () => {
    setShowMenu(false);
    console.log('Crisis support pressed');
  };

  const handleThemeSettings = () => {
    setShowMenu(false);
    toggleTheme();
  };

  const dynamicStyles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logo: {
      fontSize: 28,
      fontWeight: '300',
      color: colors.text,
      letterSpacing: -0.8,
    },
    menuContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 8,
      minWidth: 180,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '300',
    },
  });

  return (
    <>
      <View style={dynamicStyles.header}>
        <View style={styles.logoContainer}>
          <Text style={dynamicStyles.logo}>Reflect</Text>
        </View>
        
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Menu size={24} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={dynamicStyles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <LogOut size={20} color={colors.text} strokeWidth={1.5} />
              <Text style={dynamicStyles.menuItemText}>Sign Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleCrisisSupport}>
              <Phone size={20} color={colors.text} strokeWidth={1.5} />
              <Text style={dynamicStyles.menuItemText}>Crisis Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleThemeSettings}>
              <Palette size={20} color={colors.text} strokeWidth={1.5} />
              <Text style={dynamicStyles.menuItemText}>Toggle Theme</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 110,
    paddingRight: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
});