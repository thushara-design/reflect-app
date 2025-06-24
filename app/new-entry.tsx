import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import EntryActions from '@/components/EntryActions';
import AIAnalysisModal from '@/components/AIAnalysisModal';
import { useEntries } from '@/contexts/EntriesContext';
import { aiService, AIAnalysisResult } from '@/services/aiService';

export default function NewEntryPage() {
  const { prompt, entryId, title: initialTitle, content: initialContent, fromEntries } = useLocalSearchParams<{ 
    prompt?: string;
    entryId?: string;
    title?: string;
    content?: string;
    fromEntries?: string;
  }>();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addEntry, updateEntry, deleteEntry } = useEntries();
  
  const isEditing = !!entryId;
  const showContextMenu = fromEntries === 'true';

  // Set initial content
  useEffect(() => {
    if (prompt) {
      setContent(`${prompt}\n\n`);
    } else if (initialContent) {
      setContent(initialContent);
      setTitle(initialTitle || '');
    }
  }, [prompt, initialContent, initialTitle]);

  // Generate current date and time
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

  // Auto-generate title when user starts typing without a title
  useEffect(() => {
    if (content.length > 0 && title.trim() === '' && !isEditing) {
      setTitle(getCurrentDateTime());
    }
  }, [content, title, isEditing]);

  const handleVoiceTranscript = (transcript: string) => {
    // Add the transcript with proper spacing
    setContent(prev => {
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
    Alert.alert('Voice Recognition Error', error);
  };

  const handleAIAnalysis = async () => {
    if (!content.trim()) {
      Alert.alert('No Content', 'Please write something before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await aiService.analyzeEntry(content);
      setAIAnalysis(analysis);
      setShowAIAnalysis(true);
    } catch (error) {
      Alert.alert('Analysis Error', 'Failed to analyze entry. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReframe = (originalThought: string, reframedThought: string) => {
    const reframedSection = `\n\n--- Reframed Thought ---\n${reframedThought}\n`;
    setContent(prev => prev + reframedSection);
  };

  const handleActivitySelect = (activityId: string) => {
    // Could track selected activities for future recommendations
    console.log('Activity selected:', activityId);
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    // Create preview from content (first 150 characters)
    const preview = content.trim().length > 150 
      ? content.trim().substring(0, 150) + '...'
      : content.trim();

    // Determine mood based on content (simple keyword analysis)
    const determineMood = (text: string) => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || lowerText.includes('grateful')) {
        return 'positive';
      } else if (lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('frustrated')) {
        return 'negative';
      } else if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('serene')) {
        return 'calm';
      } else if (lowerText.includes('stressed') || lowerText.includes('overwhelmed') || lowerText.includes('anxious')) {
        return 'stressed';
      } else {
        return 'neutral';
      }
    };

    // Add emoji to title if AI analysis was performed
    let finalTitle = title.trim() || getCurrentDateTime();
    if (aiAnalysis?.emotion.emoji) {
      finalTitle = `${aiAnalysis.emotion.emoji} ${finalTitle}`;
    }

    if (isEditing && entryId) {
      // Update existing entry
      updateEntry(parseInt(entryId), {
        title: finalTitle,
        content: content.trim(),
        preview,
        mood: determineMood(content),
      });
    } else {
      // Create new entry
      const newEntry = {
        title: finalTitle,
        content: content.trim(),
        preview,
        date: getCurrentDateTime(),
        mood: determineMood(content),
      };
      addEntry(newEntry);
    }
    
    // Navigate back to entries tab
    router.replace('/(tabs)');
  };

  const handleEdit = () => {
    // Already in edit mode, this could toggle to a different edit state
    console.log('Edit pressed');
  };

  const handleDelete = () => {
    if (entryId) {
      Alert.alert(
        'Delete Entry',
        'Are you sure you want to delete this entry? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: () => {
              deleteEntry(parseInt(entryId));
              router.replace('/(tabs)');
            }
          }
        ]
      );
    }
  };

  const handleBack = () => {
    if (content.trim() || title.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#2A2A2A" strokeWidth={1.5} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </Text>
        
        <EntryActions
          onSavePress={handleSave}
          onAIAnalysis={handleAIAnalysis}
          showContextMenu={showContextMenu}
          onEditPress={handleEdit}
          onDeletePress={handleDelete}
          isRecording={isRecording}
          onRecordingChange={setIsRecording}
          onVoiceTranscript={handleVoiceTranscript}
          onVoiceError={handleVoiceError}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title here"
            placeholderTextColor="#A5B8C8"
            value={title}
            onChangeText={setTitle}
            multiline
          />
        </View>

        <View style={styles.contentSection}>
          <TextInput
            style={styles.contentInput}
            placeholder="Start writing..."
            placeholderTextColor="#A5B8C8"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus={!isEditing}
          />
        </View>

        <View style={styles.bottomInfo}>
          <Text style={styles.timestamp}>{getCurrentDateTime()}</Text>
          {isAnalyzing && (
            <Text style={styles.analyzingText}>Analyzing with AI...</Text>
          )}
        </View>
      </View>

      <AIAnalysisModal
        visible={showAIAnalysis}
        onClose={() => setShowAIAnalysis(false)}
        analysis={aiAnalysis}
        onSaveReframe={handleSaveReframe}
        onActivitySelect={handleActivitySelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
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
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2A2A2A',
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2A2A2A',
    lineHeight: 32,
    minHeight: 40,
  },
  contentSection: {
    flex: 1,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#2A2A2A',
    lineHeight: 24,
    fontWeight: '300',
  },
  bottomInfo: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#A5B8C8',
    fontWeight: '300',
    textAlign: 'center',
  },
  analyzingText: {
    fontSize: 12,
    color: '#A5B8C8',
    fontStyle: 'italic',
    marginTop: 4,
  },
});