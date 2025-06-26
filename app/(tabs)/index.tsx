import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import ReflectHeader from '@/components/ReflectHeader';
import { useEntries } from '@/contexts/EntriesContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function EntriesTab() {
  const [searchText, setSearchText] = useState('');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const { entries } = useEntries();
  const { userProfile, resetOnboarding, isLoading } = useOnboarding();
  const [resetting, setResetting] = useState(false);

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
          marginBottom: 12
        }
      ]}
      onPress={() => handleEntryPress(entry)}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{entry.date}</Text>
      </View>
      <Text style={styles.entryPreview}>
        {entry.preview}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ReflectHeader />

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#A5B8C8" strokeWidth={1.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search entries..."
              placeholderTextColor="#A5B8C8"
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
              <Text style={styles.emptyText}>
                {searchText ? 'No entries found' : 'No entries yet'}
              </Text>
              <Text style={styles.emptySubtext}>
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
        {/* DEV ONLY: Reset Onboarding Button */}
        {!isLoading && userProfile?.hasCompletedOnboarding && (
          <TouchableOpacity
            style={{
              margin: 16,
              padding: 14,
              backgroundColor: '#FF6B6B',
              borderRadius: 10,
              alignItems: 'center',
              opacity: resetting ? 0.5 : 1,
            }}
            onPress={async () => {
              setResetting(true);
              await resetOnboarding();
              setResetting(false);
              // Reload app to show onboarding
              router.replace('/onboarding/welcome');
            }}
            disabled={resetting}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Reset Onboarding (Dev)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2A2A2A',
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
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 11,
    color: '#A5B8C8',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  entryPreview: {
    fontSize: 13,
    color: '#2A2A2A',
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
    color: '#A5B8C8',
    fontWeight: '300',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#EAEAEA',
    fontWeight: '300',
    textAlign: 'center',
  },
});