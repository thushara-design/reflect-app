import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Menu, LogOut, Phone, Palette } from 'lucide-react-native';

interface ReflectHeaderProps {
  onMenuPress?: () => void;
}

export default function ReflectHeader({ onMenuPress }: ReflectHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

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
    console.log('Theme settings pressed');
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Reflect</Text>
        </View>
        
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Menu size={24} color="#2A2A2A" strokeWidth={1.5} />
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
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <LogOut size={20} color="#2A2A2A" strokeWidth={1.5} />
              <Text style={styles.menuItemText}>Sign Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleCrisisSupport}>
              <Phone size={20} color="#2A2A2A" strokeWidth={1.5} />
              <Text style={styles.menuItemText}>Crisis Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleThemeSettings}>
              <Palette size={20} color="#2A2A2A" strokeWidth={1.5} />
              <Text style={styles.menuItemText}>Theme Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 28,
    fontWeight: '300',
    color: '#2A2A2A',
    letterSpacing: -0.8,
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
  menuContainer: {
    backgroundColor: '#FAFAFA',
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
    borderColor: '#EAEAEA',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2A2A2A',
    fontWeight: '300',
  },
});