import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Square, SquareCheck as CheckSquare, Lightbulb } from 'lucide-react-native';
import { AIAnalysisResult, CognitiveDistortion } from '@/services/aiService';
import { aiService } from '@/services/aiService';
import { useTheme } from '@/contexts/ThemeContext';
import { UserProfile } from '@/contexts/OnboardingContext';

interface InlineAIAnalysisProps {
  analysis: AIAnalysisResult;
  onClose: () => void;
  onSaveReframe: (originalThought: string, reframedThought: string) => void;
  onActivitySelect: (activityId: string) => void;
  entryText: string;
  userProfile: UserProfile | null;
}

export default function InlineAIAnalysis({
  analysis,
  onClose,
  onSaveReframe,
  onActivitySelect,
  entryText,
  userProfile
}: InlineAIAnalysisProps) {
  const { colors } = useTheme();
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [expandedDistortions, setExpandedDistortions] = useState<Set<string>>(new Set());
  const [reframedThoughts, setReframedThoughts] = useState<Record<string, string>>({});
  const [isGeneratingReframe, setIsGeneratingReframe] = useState<Record<string, boolean>>({});

  // Get user's saved activities for the detected emotion
  const getUserActivities = () => {
    if (!userProfile?.emotionalToolkit) return [];
    
    const emotionToolkit = userProfile.emotionalToolkit.find(
      item => item.emotion.toLowerCase() === analysis.emotion.emotion.toLowerCase()
    );
    
    return emotionToolkit?.actions.map((action, index) => ({
      id: `user-${index}`,
      title: action,
      description: `Your personal coping strategy for ${analysis.emotion.emotion}`,
      duration: '5-10 minutes',
      category: 'personal'
    })) || [];
  };

  const allActivities = [...getUserActivities(), ...analysis.activities];

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

  const handleDistortionToggle = (distortionType: string) => {
    const newExpanded = new Set(expandedDistortions);
    if (newExpanded.has(distortionType)) {
      newExpanded.delete(distortionType);
    } else {
      newExpanded.add(distortionType);
    }
    setExpandedDistortions(newExpanded);
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
      console.error('Failed to generate reframed thought:', error);
    } finally {
      setIsGeneratingReframe(prev => ({ ...prev, [distortion.type]: false }));
    }
  };

  const handleSaveReframe = (distortion: CognitiveDistortion) => {
    const reframedText = reframedThoughts[distortion.type];
    if (reframedText?.trim()) {
      const originalThought = distortion.userQuotes.join(' ') || distortion.detectedText.join(' ');
      onSaveReframe(originalThought, reframedText);
      
      // Clear the reframe and collapse the card
      setReframedThoughts(prev => ({ ...prev, [distortion.type]: '' }));
      setExpandedDistortions(prev => {
        const newExpanded = new Set(prev);
        newExpanded.delete(distortion.type);
        return newExpanded;
      });
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    emotionSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    emotionEmoji: {
      fontSize: 24,
    },
    emotionText: {
      flex: 1,
    },
    emotionName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      textTransform: 'capitalize',
    },
    reflectionText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginTop: 4,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 12,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '400',
    },
    activityDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    distortionCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      overflow: 'hidden',
    },
    distortionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    distortionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    distortionContent: {
      padding: 16,
      paddingTop: 0,
    },
    userQuote: {
      fontSize: 13,
      color: colors.text,
      fontStyle: 'italic',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    explanation: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    factsTitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    factItem: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 16,
    },
    reframeSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    aiSuggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    aiSuggestionText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '400',
    },
    reframeInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 13,
      color: colors.text,
      minHeight: 60,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
    reframeActions: {
      flexDirection: 'row',
      gap: 8,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 13,
      color: colors.background,
      fontWeight: '500',
    },
    ignoreButton: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    ignoreButtonText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '400',
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FF9800';
      case 'low': return '#FFA726';
      default: return '#FF9800';
    }
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerLeft}>
          <Text style={dynamicStyles.headerTitle}>✨ AI Analysis</Text>
        </View>
        <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
          <X size={20} color={colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Emotion & Reflection */}
      <View style={dynamicStyles.emotionSection}>
        <Text style={dynamicStyles.emotionEmoji}>{analysis.emotion.emoji}</Text>
        <View style={dynamicStyles.emotionText}>
          <Text style={dynamicStyles.emotionName}>
            You sound {analysis.emotion.emotion}, based on what you wrote.
          </Text>
          <Text style={dynamicStyles.reflectionText}>
            {analysis.reflection}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
        {/* Activities Checklist */}
        {allActivities.length > 0 && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Suggested Activities</Text>
            {allActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={dynamicStyles.activityItem}
                onPress={() => handleActivityToggle(activity.id)}
              >
                {selectedActivities.has(activity.id) ? (
                  <CheckSquare size={18} color={colors.primary} strokeWidth={1.5} />
                ) : (
                  <Square size={18} color={colors.border} strokeWidth={1.5} />
                )}
                <View style={dynamicStyles.activityContent}>
                  <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
                  <Text style={dynamicStyles.activityDescription}>
                    {activity.description} • {activity.duration}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Cognitive Distortions */}
        {analysis.distortions.length > 0 && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Reframe Unhelpful Thoughts</Text>
            {analysis.distortions.map((distortion, index) => {
              const isExpanded = expandedDistortions.has(distortion.type);
              const severityColor = getSeverityColor(distortion.severity);
              
              return (
                <View 
                  key={index} 
                  style={[
                    dynamicStyles.distortionCard,
                    { borderColor: severityColor }
                  ]}
                >
                  <TouchableOpacity
                    style={dynamicStyles.distortionHeader}
                    onPress={() => handleDistortionToggle(distortion.type)}
                  >
                    <Text style={dynamicStyles.distortionTitle}>
                      {distortion.type}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    ) : (
                      <ChevronDown size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={dynamicStyles.distortionContent}>
                      {/* User Quote */}
                      {distortion.userQuotes.length > 0 && (
                        <Text style={dynamicStyles.userQuote}>
                          "{distortion.userQuotes[0]}"
                        </Text>
                      )}

                      {/* Explanation */}
                      <Text style={dynamicStyles.explanation}>
                        {distortion.description}
                      </Text>

                      {/* Grounding Facts */}
                      <Text style={dynamicStyles.factsTitle}>Let's check some facts:</Text>
                      {distortion.evidence.slice(0, 3).map((fact, factIndex) => (
                        <Text key={factIndex} style={dynamicStyles.factItem}>
                          • {fact}
                        </Text>
                      ))}

                      {/* Reframing Section */}
                      <View style={dynamicStyles.reframeSection}>
                        <TouchableOpacity
                          style={dynamicStyles.aiSuggestionButton}
                          onPress={() => handleGenerateAIReframe(distortion)}
                          disabled={isGeneratingReframe[distortion.type]}
                        >
                          <Lightbulb size={14} color={colors.primary} strokeWidth={1.5} />
                          <Text style={dynamicStyles.aiSuggestionText}>
                            {isGeneratingReframe[distortion.type] ? 'Generating...' : 'Get AI suggestion'}
                          </Text>
                        </TouchableOpacity>

                        <TextInput
                          style={dynamicStyles.reframeInput}
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

                        <View style={dynamicStyles.reframeActions}>
                          <TouchableOpacity
                            style={dynamicStyles.saveButton}
                            onPress={() => handleSaveReframe(distortion)}
                          >
                            <Text style={dynamicStyles.saveButtonText}>Save to entry</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={dynamicStyles.ignoreButton}
                            onPress={() => handleDistortionToggle(distortion.type)}
                          >
                            <Text style={dynamicStyles.ignoreButtonText}>Ignore</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}