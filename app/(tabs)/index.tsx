import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import ReflectHeader from '@/components/ReflectHeader';
import { useEntries } from '@/contexts/EntriesContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function EntriesTab() {
  const [searchText, setSearchText] = useState('');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const { entries } = useEntries();
  const { userProfile, resetOnboarding, isLoading } = useOnboarding();
  const [resetting, setResetting] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const onChange = (result: { window: any }) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const filteredEntries = entries.filter(entry => {
    return entry.preview.toLowerCase().includes(searchText.toLowerCase()) ||
           (entry.title && entry.title.toLowerCase().includes(searchText.toLowerCase()));
  });

  // Calculate responsive dimensions for 2-column layout
  const getResponsiveDimensions = () => {
    const { width } = screenData;
    const horizontalPadding = 32; // 16px on each side
    const columnGap = 12;
    const numColumns = 2;
    
    const availableWidth = width - horizontalPadding - columnGap;
    const cardWidth = Math.floor(availableWidth / numColumns);
    
    return {
      cardWidth,
      columnGap
    };
  };

  const { cardWidth, columnGap } = getResponsiveDimensions();

  // Create 2 columns for masonry layout
  const createMasonryColumns = (entries: typeof filteredEntries) => {
    const leftColumn: typeof filteredEntries = [];
    const rightColumn: typeof filteredEntries = [];
    
    entries.forEach((entry, index) => {
      if (index % 2 === 0) {
        leftColumn.push(entry);
      } else {
        rightColumn.push(entry);
      }
    });
    
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = createMasonryColumns(filteredEntries);

  const handleEntryPress = (entry: typeof entries[0]) => {
    router.push({
      pathname: '/new-entry',
      params: { 
        entryId: entry.id.toString(),
        title: entry.title,
        content: entry.content,
        fromEntries: 'true'
      }
    });
  };

  const renderEntryCard = (entry: typeof entries[0]) => (
    <TouchableOpacity 
      key={entry.id} 
      style={[
        styles.entryCard, 
        { 
          width: cardWidth,
          marginBottom: 12,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }
      ]}
      onPress={() => handleEntryPress(entry)}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.textSecondary }]}>{entry.date}</Text>
      </View>
      <Text style={{ fontSize: 15, color: colors.text, fontWeight: '400', lineHeight: 22 }}>
        {entry.preview}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ReflectHeader title="Entries" />

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.textSecondary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search entries..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <ScrollView 
          style={styles.entriesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.entriesContent}
        >
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {searchText ? 'No entries found' : 'No entries yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {searchText ? 'Try a different search term' : 'Start your reflection journey by creating your first entry'}
              </Text>
            </View>
          ) : (
            <View style={[styles.masonryContainer, { gap: columnGap }]}>
              <View style={[styles.masonryColumn, { width: cardWidth }]}>
                {leftColumn.map(renderEntryCard)}
              </View>
              
              <View style={[styles.masonryColumn, { width: cardWidth }]}>
                {rightColumn.map(renderEntryCard)}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchSection: {
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '300',
  },
  entriesContainer: {
    flex: 1,
  },
  entriesContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  masonryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  masonryColumn: {
    flexDirection: 'column',
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  entryHeader: {
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  entryPreview: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '300',
    textAlign: 'center',
  },
});