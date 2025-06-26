import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TopNavBarProps {
  title: string;
  showDarkMode?: boolean;
  showSignOut?: boolean;
}

export default function TopNavBar({ title, showDarkMode = false, showSignOut = false }: TopNavBarProps) {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    topNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    navTitle: {
      fontSize: 28,
      fontWeight: '300',
      color: colors.text,
      letterSpacing: -0.8,
    },
  });

  return (
    <View style={dynamicStyles.topNav}>
      <Text style={dynamicStyles.navTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // No additional styles needed
});