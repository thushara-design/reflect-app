import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import EntryActions from '@/components/EntryActions';
import PatternDetectionModal from '@/components/PatternDetectionModal';
import AIAnalysisCards from '@/components/AIAnalysisCards';
import { useEntries } from '@/contexts/EntriesContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPatternDetection, setShowPatternDetection] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState<any>(null);
  const [showAnalysisCards, setShowAnalysisCards] = useState(false);
  const [savedAnalysis, setSavedAnalysis] = useState<AIAnalysisResult | null>(null);
  const { addEntry, updateEntry, deleteEntry } = useEntries();
  const { userProfile } = useOnboarding();
  const { colors } = useTheme();
  
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

  // Check for unhelpful patterns as user types
  useEffect(() => {
    if (content.length > 50) {
      checkForUnhelpfulPatterns(content);
    }
  }, [content]);

  const checkForUnhelpfulPatterns = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Check for catastrophizing
    const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined'];
    const foundCatastrophizing = catastrophizingWords.filter(word => lowerText.includes(word));
    
    if (foundCatastrophizing.length >= 2 && !showPatternDetection) {
      setDetectedPattern({
        type: 'Catastrophizing',
        explanation: 'This pattern involves imagining the worst-case scenario or thinking that something is far worse than it actually is.',
        challengingFacts: [
          'Most situations have multiple possible outcomes, not just the worst one',
          'You have successfully handled difficult situations before',
          'Even challenging situations often have solutions or ways to cope'
        ]
      });
      setShowPatternDetection(true);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setContent(prev => {
      const trimmedPrev = prev.trim();
      const trimmedTranscript = transcript.trim();
      
      if (!trimmedPrev) {
        return trimmedTranscript;
      }
      
      return trimmedPrev + ' ' + trimmedTranscript;
    });
  };

  const handleVoiceError = (error: string) => {
    Alert.alert('Voice Recognition Error', error);
  };

  const handleAIAnalysis = async () => {
    console.log('AI Analysis button pressed');
    
    if (!content.trim()) {
      Alert.alert('No Content', 'Please write something before analyzing.');
      return;
    }

    // If we already have saved analysis for this content, show it
    if (savedAnalysis) {
      setAIAnalysis(savedAnalysis);
      setShowAnalysisCards(true);
      return;
    }

    console.log('Starting AI analysis...');
    setIsAnalyzing(true);
    
    try {
      console.log('Calling aiService.analyzeEntry...');
      const analysis = await aiService.analyzeEntry(content);
      console.log('AI Analysis completed:', analysis);
      
      setAIAnalysis(analysis);
      setSavedAnalysis(analysis); // Save for future clicks
      setShowAnalysisCards(true);
      console.log('Analysis cards should now be visible');
    } catch (error) {
      console.error('AI Analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze entry. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReframe = (originalThought: string, reframedThought: string) => {
    const reframedSection = `\n\n--- Reframed Thought ---\nOriginal: ${originalThought}\nReframed: ${reframedThought}\n`;
    setContent(prev => prev + reframedSection);
  };

  const handlePatternReframe = (reframedThought: string) => {
    const reframedSection = `\n\n--- Reframed Thought ---\n${reframedThought}\n`;
    setContent(prev => prev + reframedSection);
  };

  const handleActivitySelect = (activityId: string) => {
    console.log('Activity selected:', activityId);
  };

  const handleCloseAnalysisCards = () => {
    setShowAnalysisCards(false);
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    const preview = content.trim().length > 150 
      ? content.trim().substring(0, 150) + '...'
      : content.trim();

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

    let finalTitle = title.trim() || getCurrentDateTime();
    if (aiAnalysis?.emotion.emoji) {
      finalTitle = `${aiAnalysis.emotion.emoji} ${finalTitle}`;
    }

    const entryData = {
      title: finalTitle,
      content: content.trim(),
      preview,
      mood: determineMood(content),
      aiAnalysis: savedAnalysis, // Save the analysis with the entry
    };

    if (isEditing && entryId) {
      updateEntry(parseInt(entryId), entryData);
    } else {
      const newEntry = {
        ...entryData,
        date: getCurrentDateTime(),
      };
      addEntry(newEntry);
    }
    
    router.replace('/(tabs)');
  };

  const handleEdit = () => {
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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    headerTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      letterSpacing: -0.3,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    titleInput: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 32,
      minHeight: 40,
      marginTop: 16,
      marginBottom: 16,
    },
    contentInput: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontWeight: '300',
      minHeight: 200,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    userTextSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userTextTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 12,
    },
    userText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    bottomInfo: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    timestamp: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '300',
      textAlign: 'center',
    },
    analyzingText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },
  });

  if (showAnalysisCards && aiAnalysis) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCloseAnalysisCards}>
            <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={dynamicStyles.headerTitle}>AI Analysis</Text>
          
          <TouchableOpacity style={styles.backButton} onPress={handleSave}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.content}>
            {/* User's Text Display */}
            <View style={dynamicStyles.userTextSection}>
              <Text style={dynamicStyles.userTextTitle}>Your Entry</Text>
              <Text style={dynamicStyles.userText}>{content}</Text>
            </View>

            {/* AI Analysis Cards */}
            <AIAnalysisCards
              analysis={aiAnalysis}
              onSaveReframe={handleSaveReframe}
              onActivitySelect={handleActivitySelect}
              entryText={content}
              userProfile={userProfile}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      {/* Main Entry Screen */}
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={dynamicStyles.headerTitle}>
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

        <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.content}>
            <TextInput
              style={dynamicStyles.titleInput}
              placeholder="Title here"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              multiline
            />

            <TextInput
              style={dynamicStyles.contentInput}
              placeholder="Start writing..."
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              autoFocus={!isEditing}
            />
          </View>
        </ScrollView>

        <View style={dynamicStyles.bottomInfo}>
          <Text style={dynamicStyles.timestamp}>{getCurrentDateTime()}</Text>
          {isAnalyzing && (
            <Text style={dynamicStyles.analyzingText}>Analyzing with AI...</Text>
          )}
        </View>
      </View>

      {/* Pattern Detection Modal */}
      <PatternDetectionModal
        visible={showPatternDetection}
        onClose={() => setShowPatternDetection(false)}
        patternType={detectedPattern?.type || ''}
        explanation={detectedPattern?.explanation || ''}
        challengingFacts={detectedPattern?.challengingFacts || []}
        onSaveReframe={handlePatternReframe}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
});