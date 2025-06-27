import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { PenTool, CirclePlus as PlusCircleIcon, Plus as PlusIcon } from 'lucide-react-native';
import TopNavBar from '@/components/TopNavBar';
import OpenMojiIcon from '@/components/OpenMojiIcon';

export default function AddTab() {
  const { colors } = useTheme();
  const handleNewEntry = () => {
    router.push('/new-entry');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 30,
    },
    header: {
      paddingVertical: 72,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiCircle: {
      width: 100,
      height: 100,
      borderRadius: 999,
      backgroundColor: colors.accentSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '300',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    quickStartSection: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    newEntryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 64,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    newEntryText: {
      fontSize: 18,
      color: colors.background,
      fontWeight: '400',
    },
  });

  return (
    <View style={styles.container}>
      <TopNavBar title="New Entry" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.emojiCircle}>
            <OpenMojiIcon 
              uri="https://openmoji.org/data/black/svg/1F642.svg"
              width={48}
              height={48}
            />
          </View>
          <Text style={styles.title}>How are you feeling today?</Text>
        </View>

        {/* Quick Start */}
        <View style={styles.quickStartSection}>
          <TouchableOpacity style={styles.newEntryButton} onPress={handleNewEntry}>
            <PlusIcon size={24} color={colors.background} strokeWidth={1.5} />
            <Text style={styles.newEntryText}>Add a note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}