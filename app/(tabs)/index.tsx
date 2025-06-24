import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import ReflectHeader from '@/components/ReflectHeader';
import EntryActions from '@/components/EntryActions';
import { useEntries } from '@/contexts/EntriesContext';

export default function EntriesTab() {
  const [searchText, setSearchText] = useState('');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [entryContent, setEntryContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { entries, addEntry } = useEntries();

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

  const handleVoiceTranscript = (transcript: string) => {
    // Add the transcript with proper spacing
    setEntryContent(prev => {
      const trimmedPrev = prev.trim();
      const trimmedTranscript = transcript.trim();
      
      if (!trimmedPrev) {
        return trimmedTranscript;
      }
      
      // Add a space between existing content and new transcript
      return trimmedPrev + ' ' + trimmedTranscript;
    });
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice error:', error);
  };

  const handleSavePress = () => {
    if (!entryContent.trim()) return;

    const getCurrentDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      return now.toLocaleDateString('en-US', options);
    };

    const preview = entryContent.trim().length > 150 
      ? entryContent.trim().substring(0, 150) + '...'
      : entryContent.trim();

    const newEntry = {
      title: getCurrentDateTime(),
      content: entryContent.trim(),
      preview,
      date: getCurrentDateTime(),
      mood: 'neutral',
    };

    addEntry(newEntry);
    setEntryContent('');
    setIsCreatingEntry(false);
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
        <View style={styles.entryCreationSection}>
          <View style={styles.entryCreationHeader}>
            <Text style={styles.entryCreationTitle}>
              {isCreatingEntry ? 'New Entry' : 'Quick Reflection'}
            </Text>
            <EntryActions
              onSavePress={handleSavePress}
              isRecording={isRecording}
              onRecordingChange={setIsRecording}
              onVoiceTranscript={handleVoiceTranscript}
              onVoiceError={handleVoiceError}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.entryInput}
            onPress={() => setIsCreatingEntry(true)}
          >
            {isCreatingEntry ? (
              <TextInput
                style={styles.entryTextInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#A5B8C8"
                value={entryContent}
                onChangeText={setEntryContent}
                multiline
                autoFocus
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.entryPlaceholder}>
                What's on your mind?
              </Text>
            )}
          </TouchableOpacity>
        </View>

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
                {searchText ? 'Try a different search term' : 'Start writing your first entry above'}
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
  entryCreationSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    marginBottom: 16,
  },
  entryCreationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryCreationTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2A2A2A',
  },
  entryInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  entryTextInput: {
    fontSize: 16,
    color: '#2A2A2A',
    fontWeight: '300',
    flex: 1,
    textAlignVertical: 'top',
  },
  entryPlaceholder: {
    fontSize: 16,
    color: '#A5B8C8',
    fontWeight: '300',
  },
  searchSection: {
    paddingVertical: 8,
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