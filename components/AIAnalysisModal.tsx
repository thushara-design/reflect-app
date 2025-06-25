import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { X, Sparkles, SquareCheck as CheckSquare, Square, TriangleAlert as AlertTriangle, Lightbulb } from 'lucide-react-native';
import { AIAnalysisResult, CognitiveDistortion } from '@/services/aiService';
import { aiService } from '@/services/aiService';
import { useTheme } from '@/contexts/ThemeContext';

interface AIAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: AIAnalysisResult | null;
  onSaveReframe: (originalThought: string, reframedThought: string) => void;
  onActivitySelect: (activityId: string) => void;
  entryText?: string;
}

export default function AIAnalysisModal({ 
  visible, 
  onClose, 
  analysis,
  onSaveReframe,
  onActivitySelect,
  entryText = ''
}: AIAnalysisModalProps) {
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [reframedThoughts, setReframedThoughts] = useState<Record<string, string>>({});
  const [showReframing, setShowReframing] = useState<Record<string, boolean>>({});
  const [isGeneratingReframe, setIsGeneratingReframe] = useState<Record<string, boolean>>({});
  const { colors } = useTheme();

  console.log('AIAnalysisModal render - visible:', visible, 'analysis:', !!analysis);

  if (!analysis) {
    console.log('No analysis data, not rendering modal content');
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={[dynamicStyles.container, { backgroundColor: colors.background }]}>
          <View style={[dynamicStyles.header, { borderBottomColor: colors.border }]}>
            <View style={dynamicStyles.headerLeft}>
              <Sparkles size={24} color={colors.primary} strokeWidth={1.5} />
              <Text style={[dynamicStyles.headerTitle, { color: colors.text }]}>AI Analysis</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.text }}>Loading analysis...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const handleActivityToggle = (activityId: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
    onActivitySelect(activityId);
  };

  const handleReframeToggle = (distortionType: string) => {
    setShowReframing(prev => ({
      ...prev,
      [distortionType]: !prev[distortionType]
    }));
  };

  const handleGenerateAIReframe = async (distortion: CognitiveDistortion) => {
    setIsGeneratingReframe(prev => ({ ...prev, [distortion.type]: true }));
    
    try {
      const originalThought = distortion.userQuotes.join(' ') || distortion.detectedText.join(' ');
      const reframedThought = await aiService.generateReframedThought(
        originalThought, 
        distortion.type, 
        entryText
      );
      
      setReframedThoughts(prev => ({
        ...prev,
        [distortion.type]: reframedThought
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to generate reframed thought. Please try writing your own.');
    } finally {
      setIsGeneratingReframe(prev => ({ ...prev, [distortion.type]: false }));
    }
  };

  const handleReframeSave = (distortion: CognitiveDistortion) => {
    const reframedText = reframedThoughts[distortion.type];
    if (reframedText?.trim()) {
      const originalThought = distortion.userQuotes.join(' ') || distortion.detectedText.join(' ');
      onSaveReframe(originalThought, reframedText);
      setShowReframing(prev => ({ ...prev, [distortion.type]: false }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FF9800';
      case 'low': return '#FFA726';
      default: return '#FF9800';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Medium Priority';
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    section: {
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    emotionCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
    },
    emotionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    emotionEmoji: {
      fontSize: 32,
    },
    emotionInfo: {
      flex: 1,
    },
    emotionName: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      textTransform: 'capitalize',
    },
    emotionConfidence: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    gentleReflection: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontStyle: 'italic',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border + '40',
    },
    distortionCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    distortionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 'auto',
    },
    severityText: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.background,
    },
    distortionType: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      flex: 1,
    },
    distortionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    quotesSection: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    quotesTitle: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    userQuote: {
      fontSize: 14,
      color: colors.text,
      fontStyle: 'italic',
      marginBottom: 4,
      lineHeight: 18,
    },
    evidenceTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 8,
    },
    evidenceItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
    reframeButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 12,
      alignItems: 'center',
    },
    reframeButtonText: {
      fontSize: 14,
      color: colors.background,
      fontWeight: '400',
    },
    reframingSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    reframingPrompt: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
      fontWeight: '400',
    },
    aiSuggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      marginBottom: 12,
    },
    aiSuggestionText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '400',
    },
    reframingInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
    reframingActions: {
      flexDirection: 'row',
      gap: 12,
    },
    saveReframeButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveReframeText: {
      fontSize: 14,
      color: colors.background,
      fontWeight: '400',
    },
    cancelReframeButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelReframeText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    activityCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 12,
    },
    activityTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
    },
    activityDuration: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activityDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginLeft: 32,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerLeft}>
            <Sparkles size={24} color={colors.primary} strokeWidth={1.5} />
            <Text style={dynamicStyles.headerTitle}>AI Analysis</Text>
          </View>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Emotional Tone Detected</Text>
            <View style={dynamicStyles.emotionCard}>
              <View style={dynamicStyles.emotionHeader}>
                <Text style={dynamicStyles.emotionEmoji}>{analysis.emotion.emoji}</Text>
                <View style={dynamicStyles.emotionInfo}>
                  <Text style={dynamicStyles.emotionName}>{analysis.emotion.emotion}</Text>
                  <Text style={dynamicStyles.emotionConfidence}>
                    {Math.round(analysis.emotion.confidence * 100)}% confidence
                  </Text>
                </View>
              </View>
              <Text style={dynamicStyles.gentleReflection}>
                {analysis.reflection}
              </Text>
            </View>
          </View>

          {analysis.distortions.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>⚠️ Unhelpful Thinking Patterns Detected</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                These patterns might be making you feel worse. Let's work on reframing them:
              </Text>
              {analysis.distortions.map((distortion, index) => (
                <View 
                  key={index} 
                  style={[
                    dynamicStyles.distortionCard,
                    { borderColor: getSeverityColor(distortion.severity) }
                  ]}
                >
                  <View style={dynamicStyles.distortionHeader}>
                    <AlertTriangle size={20} color={getSeverityColor(distortion.severity)} strokeWidth={1.5} />
                    <Text style={dynamicStyles.distortionType}>{distortion.type}</Text>
                    <View style={[dynamicStyles.severityBadge, { backgroundColor: getSeverityColor(distortion.severity) }]}>
                      <Text style={dynamicStyles.severityText}>{getSeverityLabel(distortion.severity)}</Text>
                    </View>
                  </View>
                  
                  <Text style={dynamicStyles.distortionDescription}>{distortion.description}</Text>
                  
                  {distortion.userQuotes.length > 0 && (
                    <View style={dynamicStyles.quotesSection}>
                      <Text style={dynamicStyles.quotesTitle}>Your words that triggered this detection:</Text>
                      {distortion.userQuotes.map((quote, quoteIndex) => (
                        <Text key={quoteIndex} style={dynamicStyles.userQuote}>
                          "{quote.trim()}"
                        </Text>
                      ))}
                    </View>
                  )}

                  <Text style={dynamicStyles.evidenceTitle}>Let's check some facts:</Text>
                  {distortion.evidence.map((fact, factIndex) => (
                    <Text key={factIndex} style={dynamicStyles.evidenceItem}>• {fact}</Text>
                  ))}

                  <TouchableOpacity
                    style={dynamicStyles.reframeButton}
                    onPress={() => handleReframeToggle(distortion.type)}
                  >
                    <Text style={dynamicStyles.reframeButtonText}>
                      {showReframing[distortion.type] ? 'Hide Reframing' : 'Reframe This Thought'}
                    </Text>
                  </TouchableOpacity>

                  {showReframing[distortion.type] && (
                    <View style={dynamicStyles.reframingSection}>
                      <Text style={dynamicStyles.reframingPrompt}>{distortion.reframingPrompt}</Text>
                      
                      <TouchableOpacity
                        style={dynamicStyles.aiSuggestionButton}
                        onPress={() => handleGenerateAIReframe(distortion)}
                        disabled={isGeneratingReframe[distortion.type]}
                      >
                        <Lightbulb size={16} color={colors.primary} strokeWidth={1.5} />
                        <Text style={dynamicStyles.aiSuggestionText}>
                          {isGeneratingReframe[distortion.type] ? 'Generating...' : 'Generate AI suggestion'}
                        </Text>
                      </TouchableOpacity>

                      <TextInput
                        style={dynamicStyles.reframingInput}
                        placeholder="Write a more balanced version of this thought..."
                        placeholderTextColor={colors.textSecondary}
                        value={reframedThoughts[distortion.type] || ''}
                        onChangeText={(text) => setReframedThoughts(prev => ({
                          ...prev,
                          [distortion.type]: text
                        }))}
                        multiline
                        textAlignVertical="top"
                      />
                      <View style={dynamicStyles.reframingActions}>
                        <TouchableOpacity
                          style={dynamicStyles.saveReframeButton}
                          onPress={() => handleReframeSave(distortion)}
                        >
                          <Text style={dynamicStyles.saveReframeText}>Save to Entry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={dynamicStyles.cancelReframeButton}
                          onPress={() => setShowReframing(prev => ({ ...prev, [distortion.type]: false }))}
                        >
                          <Text style={dynamicStyles.cancelReframeText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {analysis.activities.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Suggested Activities</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Based on your emotional state, here are some activities that might help:
              </Text>
              {analysis.activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={dynamicStyles.activityCard}
                  onPress={() => handleActivityToggle(activity.id)}
                >
                  <View style={dynamicStyles.activityHeader}>
                    {selectedActivities.has(activity.id) ? (
                      <CheckSquare size={20} color={colors.primary} strokeWidth={1.5} />
                    ) : (
                      <Square size={20} color={colors.border} strokeWidth={1.5} />
                    )}
                    <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
                    <Text style={dynamicStyles.activityDuration}>{activity.duration}</Text>
                  </View>
                  <Text style={dynamicStyles.activityDescription}>{activity.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}