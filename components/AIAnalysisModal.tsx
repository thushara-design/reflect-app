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

  // Don't render anything if not visible - let React Native handle the modal
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={24} color={colors.primary} strokeWidth={1.5} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Analysis</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Show loading state if no analysis */}
        {!analysis ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Analyzing your entry...</Text>
            <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
              This may take a moment while we process your thoughts
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Debug information in development */}
            {__DEV__ && (
              <View style={[styles.debugContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.debugTitle, { color: colors.text }]}>Debug Info:</Text>
                <Text style={[styles.debugText, { color: colors.textSecondary }]}>
                  Analysis present: {!!analysis}{'\n'}
                  Emotion: {analysis.emotion?.emotion || 'none'}{'\n'}
                  Distortions: {analysis.distortions?.length || 0}{'\n'}
                  Activities: {analysis.activities?.length || 0}{'\n'}
                  Reflection: {analysis.reflection ? 'present' : 'missing'}
                </Text>
              </View>
            )}

            {/* Emotional Tone Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Emotional Tone Detected</Text>
              <View style={[styles.emotionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.emotionHeader}>
                  <Text style={styles.emotionEmoji}>
                    {analysis.emotion?.emoji || '😐'}
                  </Text>
                  <View style={styles.emotionInfo}>
                    <Text style={[styles.emotionName, { color: colors.text }]}>
                      {analysis.emotion?.emotion || 'neutral'}
                    </Text>
                    <Text style={[styles.emotionConfidence, { color: colors.textSecondary }]}>
                      {Math.round((analysis.emotion?.confidence || 0.7) * 100)}% confidence
                    </Text>
                  </View>
                </View>
                <Text style={[styles.gentleReflection, { color: colors.textSecondary, borderTopColor: colors.border + '40' }]}>
                  {analysis.reflection || 'Your entry shows emotional awareness and self-reflection.'}
                </Text>
              </View>
            </View>

            {/* Cognitive Distortions Section */}
            {analysis.distortions && analysis.distortions.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Unhelpful Thinking Patterns Detected</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  These patterns might be making you feel worse. Let's work on reframing them:
                </Text>
                {analysis.distortions.map((distortion, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.distortionCard,
                      { 
                        backgroundColor: colors.surface,
                        borderColor: getSeverityColor(distortion.severity)
                      }
                    ]}
                  >
                    <View style={styles.distortionHeader}>
                      <AlertTriangle size={20} color={getSeverityColor(distortion.severity)} strokeWidth={1.5} />
                      <Text style={[styles.distortionType, { color: colors.text }]}>{distortion.type}</Text>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(distortion.severity) }]}>
                        <Text style={[styles.severityText, { color: colors.background }]}>{getSeverityLabel(distortion.severity)}</Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.distortionDescription, { color: colors.textSecondary }]}>{distortion.description}</Text>
                    
                    {distortion.userQuotes && distortion.userQuotes.length > 0 && (
                      <View style={[styles.quotesSection, { backgroundColor: colors.background }]}>
                        <Text style={[styles.quotesTitle, { color: colors.textSecondary }]}>Your words that triggered this detection:</Text>
                        {distortion.userQuotes.map((quote, quoteIndex) => (
                          <Text key={quoteIndex} style={[styles.userQuote, { color: colors.text }]}>
                            "{quote.trim()}"
                          </Text>
                        ))}
                      </View>
                    )}

                    <Text style={[styles.evidenceTitle, { color: colors.text }]}>Let's check some facts:</Text>
                    {(distortion.evidence || []).map((fact, factIndex) => (
                      <Text key={factIndex} style={[styles.evidenceItem, { color: colors.textSecondary }]}>• {fact}</Text>
                    ))}

                    <TouchableOpacity
                      style={[styles.reframeButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleReframeToggle(distortion.type)}
                    >
                      <Text style={[styles.reframeButtonText, { color: colors.background }]}>
                        {showReframing[distortion.type] ? 'Hide Reframing' : 'Reframe This Thought'}
                      </Text>
                    </TouchableOpacity>

                    {showReframing[distortion.type] && (
                      <View style={[styles.reframingSection, { borderTopColor: colors.border }]}>
                        <Text style={[styles.reframingPrompt, { color: colors.text }]}>
                          {distortion.reframingPrompt || 'How might I view this situation more objectively?'}
                        </Text>
                        
                        <TouchableOpacity
                          style={styles.aiSuggestionButton}
                          onPress={() => handleGenerateAIReframe(distortion)}
                          disabled={isGeneratingReframe[distortion.type]}
                        >
                          <Lightbulb size={16} color={colors.primary} strokeWidth={1.5} />
                          <Text style={[styles.aiSuggestionText, { color: colors.primary }]}>
                            {isGeneratingReframe[distortion.type] ? 'Generating...' : 'Generate AI suggestion'}
                          </Text>
                        </TouchableOpacity>

                        <TextInput
                          style={[styles.reframingInput, { 
                            backgroundColor: colors.surface, 
                            borderColor: colors.border,
                            color: colors.text
                          }]}
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
                        <View style={styles.reframingActions}>
                          <TouchableOpacity
                            style={[styles.saveReframeButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleReframeSave(distortion)}
                          >
                            <Text style={[styles.saveReframeText, { color: colors.background }]}>Save to Entry</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.cancelReframeButton, { 
                              backgroundColor: colors.surface,
                              borderColor: colors.border
                            }]}
                            onPress={() => setShowReframing(prev => ({ ...prev, [distortion.type]: false }))}
                          >
                            <Text style={[styles.cancelReframeText, { color: colors.textSecondary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Suggested Activities Section */}
            {analysis.activities && analysis.activities.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested Activities</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Based on your emotional state, here are some activities that might help:
                </Text>
                {analysis.activities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleActivityToggle(activity.id)}
                  >
                    <View style={styles.activityHeader}>
                      {selectedActivities.has(activity.id) ? (
                        <CheckSquare size={20} color={colors.primary} strokeWidth={1.5} />
                      ) : (
                        <Square size={20} color={colors.border} strokeWidth={1.5} />
                      )}
                      <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                      <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>{activity.duration}</Text>
                    </View>
                    <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>{activity.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  emotionCard: {
    borderWidth: 1,
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
    textTransform: 'capitalize',
  },
  emotionConfidence: {
    fontSize: 12,
    marginTop: 2,
  },
  gentleReflection: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  distortionCard: {
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
  },
  distortionType: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  distortionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  quotesSection: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  quotesTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 18,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  evidenceItem: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  reframeButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  reframeButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
  reframingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  reframingPrompt: {
    fontSize: 14,
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
    fontWeight: '400',
  },
  reframingInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
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
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveReframeText: {
    fontSize: 14,
    fontWeight: '400',
  },
  cancelReframeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelReframeText: {
    fontSize: 14,
    fontWeight: '400',
  },
  activityCard: {
    borderWidth: 1,
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
  },
  activityDuration: {
    fontSize: 12,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  debugContainer: {
    borderRadius: 8,
    padding: 16,
    margin: 16,
    borderWidth: 1,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});