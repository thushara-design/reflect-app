import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import EntryActions from '@/components/EntryActions';
import PatternDetectionModal from '@/components/PatternDetectionModal';
import AIAnalysisCards from '@/components/AIAnalysisCards';
import { useEntries } from '@/contexts/EntriesContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { aiService, AIAnalysisResult } from '@/services/aiService';
import React from 'react';

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
  const { addEntry, updateEntry, deleteEntry, entries } = useEntries();
  const { userProfile } = useOnboarding();
  const { colors } = useTheme();
  
  const isEditing = !!entryId;
  const showContextMenu = fromEntries === 'true';
  const userHasAI = userProfile?.useAI ?? true; // Default to true for backward compatibility

  // Set initial content
  useEffect(() => {
    if (prompt) {
      setContent(`${prompt}\n\n`);
    } else if (initialContent) {
      setContent(initialContent);
      setTitle(initialTitle || '');
      // Load saved analysis if present
      if (entryId) {
        const entry = entries.find(e => e.id === parseInt(entryId));
        if (entry?.aiAnalysis) {
          setSavedAnalysis(entry.aiAnalysis);
          setAIAnalysis(entry.aiAnalysis);
        }
      }
    }
  }, [prompt, initialContent, initialTitle, entryId, entries]);

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

  // Check for unhelpful patterns as user types (only if AI is enabled)
  useEffect(() => {
    if (userHasAI && content.length > 50) {
      checkForUnhelpfulPatterns(content);
    }
  }, [content, userHasAI]);

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
    console.log('=== Analysis Button Pressed ===');
    console.log('AI enabled:', userHasAI);
    console.log('User profile:', userProfile);
    console.log('User toolkit:', userProfile?.emotionalToolkit);
    
    if (!content.trim()) {
      Alert.alert('No Content', 'Please write something before analyzing.');
      return;
    }

    // If we already have saved analysis for this content, show it
    if (savedAnalysis) {
      console.log('Using saved analysis');
      setAIAnalysis(savedAnalysis);
      setShowAnalysisCards(true);
      return;
    }

    console.log('Starting new analysis...');
    setIsAnalyzing(true);
    
    try {
      console.log('Calling aiService.analyzeEntry...');
      // Pass user's emotional toolkit to the AI service
      const userToolkit = userProfile?.emotionalToolkit || [];
      console.log('Passing toolkit to AI service:', userToolkit);
      const analysis = await aiService.analyzeEntry(content, userToolkit, userHasAI);
      console.log('Analysis completed:', analysis);
      
      setAIAnalysis(analysis);
      setSavedAnalysis(analysis); // Save for future clicks
      setShowAnalysisCards(true);
      console.log('Analysis cards should now be visible');
    } catch (error) {
      console.error('Analysis error:', error);
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
    if (!entryId) {
      Alert.alert('Error', 'Cannot delete entry: Entry ID not found.');
      return;
    }

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            try {
              console.log('Deleting entry with ID:', entryId);
              deleteEntry(parseInt(entryId));
              console.log('Entry deleted successfully');
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          }
        }
      ]
    );
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
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
    },
    titleInput: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 32,
      minHeight: 40,
      marginBottom: 20,
      paddingVertical: 8,
    },
    contentInput: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontWeight: '300',
      flex: 1,
      textAlignVertical: 'top',
      paddingVertical: 8,
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
      flexDirection: 'row',
      justifyContent: 'center',
      position: 'relative',
    },
    deleteButton: {
      position: 'absolute',
      left: 24,
      padding: 8,
      borderRadius: 8,
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
            <ArrowLeft size={24} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={dynamicStyles.headerTitle}>
            {'Reflection'}
          </Text>
          
          <TouchableOpacity style={styles.backButton} onPress={handleSave}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 16 }} />
        <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.content}>
            {/* User's Text Display */}
            <View style={[dynamicStyles.userTextSection, { marginTop: 16 }]}>
              <Text style={{ fontSize: 18, color: colors.text, fontWeight: '700', marginBottom: 8 }}>{'Your Entry'}</Text>
              <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', lineHeight: 22 }}>{content}</Text>
            </View>

            {/* Analysis Cards */}
            <AIAnalysisCards
              analysis={aiAnalysis}
              onSaveReframe={handleSaveReframe}
              onActivitySelect={handleActivitySelect}
              entryText={content}
              userProfile={userProfile}
              detectedEmotion={aiAnalysis.emotion.emotion}
              useAI={userHasAI}
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
            <ArrowLeft size={24} color={colors.primary} strokeWidth={1.5} />
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
            iconColor={colors.primary}
          />
        </View>

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

        <View style={dynamicStyles.bottomInfo}>
          {isEditing && (
            <TouchableOpacity 
              style={dynamicStyles.deleteButton} 
              onPress={handleDelete}
            >
              <Trash2 size={22} color={colors.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={dynamicStyles.timestamp}>{getCurrentDateTime()}</Text>
            {isAnalyzing && (
              <Text style={dynamicStyles.analyzingText}>
                {userHasAI ? 'Analyzing with AI...' : 'Analyzing entry...'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Pattern Detection Modal - only show if AI is enabled */}
      {userHasAI && (
        <PatternDetectionModal
          visible={showPatternDetection}
          onClose={() => setShowPatternDetection(false)}
          patternType={detectedPattern?.type || ''}
          explanation={detectedPattern?.explanation || ''}
          challengingFacts={detectedPattern?.challengingFacts || []}
          onSaveReframe={handlePatternReframe}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
});