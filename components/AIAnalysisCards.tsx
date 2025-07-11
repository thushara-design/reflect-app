import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Square, SquareCheck as CheckSquare, Lightbulb, Brain, Activity, Sparkles } from 'lucide-react-native';
import { AIAnalysisResult, CognitiveDistortion } from '@/services/aiService';
import { aiService } from '@/services/aiService';
import { useTheme } from '@/contexts/ThemeContext';
import { UserProfile } from '@/contexts/OnboardingContext';

interface AIAnalysisCardsProps {
  analysis: AIAnalysisResult;
  onSaveReframe: (originalThought: string, reframedThought: string) => void;
  onActivitySelect: (activity: any) => void;
  entryText: string;
  userProfile: UserProfile | null;
  detectedEmotion: string;
  useAI: boolean;
}

export default function AIAnalysisCards({
  analysis,
  onSaveReframe,
  onActivitySelect,
  entryText,
  userProfile,
  detectedEmotion,
  useAI
}: AIAnalysisCardsProps) {
  const { colors } = useTheme();
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [expandedDistortions, setExpandedDistortions] = useState<Set<string>>(new Set());
  const [reframedThoughts, setReframedThoughts] = useState<Record<string, string>>({});
  const [isGeneratingReframe, setIsGeneratingReframe] = useState<Record<string, boolean>>({});

  const handleActivityToggle = (activity: any) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activity.id)) {
      newSelected.delete(activity.id);
    } else {
      newSelected.add(activity.id);
    }
    setSelectedActivities(newSelected);
    onActivitySelect(activity);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FF9800';
      case 'low': return '#FFA726';
      default: return '#FF9800';
    }
  };

  // Separate user activities from AI activities
  const userActivities = analysis.activities.filter(activity => activity.category === 'personal');
  const aiActivities = analysis.activities.filter(activity => activity.category !== 'personal');

  let displayedUserActivities: typeof userActivities = [];
  let displayedAIActivities: typeof aiActivities = [];

  if (userActivities.length > 0) {
    // If user has saved activities
    displayedUserActivities = userActivities;
    if (useAI) {
      // In AI mode, allow one extra AI/predefined activity
      displayedAIActivities = aiActivities.slice(0, 1);
    } else {
      // In basic mode, show only user activities
      displayedAIActivities = [];
    }
  } else {
    // No user activities, fallback to current logic (up to 3 total, prioritizing user, then AI)
    displayedUserActivities = userActivities.slice(0, 3);
    if (displayedUserActivities.length < 3) {
      displayedAIActivities = aiActivities.slice(0, 3 - displayedUserActivities.length);
    } else {
      displayedAIActivities = [];
    }
  }

  // Sync checked activities with entryText
  useEffect(() => {
    const checked = new Set<string>();
    const allActivities = [...displayedUserActivities, ...displayedAIActivities];
    allActivities.forEach(activity => {
      const completedLine = `Completed activity - ${activity.title}`;
      if (entryText.includes(completedLine)) {
        checked.add(activity.id);
      }
    });
    setSelectedActivities(checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryText, analysis.activities]);

  const dynamicStyles = StyleSheet.create({
    container: {
      gap: 20,
    },
    card: {
      borderRadius: 16,
      padding: 20,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#181818',
      flex: 1,
    },
    emotionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 8,
      flexWrap: 'wrap',
    },
    emotionEmoji: {
      fontSize: 32,
    },
    emotionContent: {
      flex: 1,
    },
    emotionText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#181818',
      marginBottom: 4,
    },
    confidenceText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    reflectionText: {
      fontSize: 15,
      color: '#181818',
      lineHeight: 22,
      fontStyle: 'normal',
    },
    activitiesSection: {
      marginBottom: 16,
    },
    sectionSubtitle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#181818',
      marginBottom: 12,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 15,
      color: '#181818',
      fontWeight: 'bold',
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 15,
      color: '#181818',
      lineHeight: 22,
    },
    activityMeta: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: '500',
    },
    personalActivityMeta: {
      color: colors.primary,
    },
    distortionCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
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
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    severityText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.background,
      textTransform: 'uppercase',
    },
    distortionContent: {
      padding: 16,
      paddingTop: 0,
    },
    userQuote: {
      fontSize: 14,
      color: colors.text,
      fontStyle: 'italic',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    explanation: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    factsSection: {
      marginBottom: 16,
    },
    factsTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    factItem: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
      lineHeight: 18,
      paddingLeft: 12,
    },
    reframeSection: {
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    reframeTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 12,
    },
    aiSuggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    aiSuggestionText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    reframeInput: {
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
    reframeActions: {
      flexDirection: 'row',
      gap: 12,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 14,
      color: colors.background,
      fontWeight: '400',
    },
    ignoreButton: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    ignoreButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '400',
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.border,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Card 1: Emotion Analysis */}
      <View style={[dynamicStyles.card, { backgroundColor: '#FFF3EC' }]}> 
        <View style={dynamicStyles.emotionRow}>
          <Text style={dynamicStyles.emotionEmoji}>{analysis.emotion.emoji}</Text>
          <Text style={{ fontSize: 18, color: '#181818', fontWeight: '700', flexShrink: 1, flexWrap: 'wrap' }}>
            {analysis.emotion.emotion === 'distress'
              ? 'You sound distressed, based on what you wrote.'
              : analysis.emotion.emotion === 'neutral'
                ? "Layered/Subtle"
                : `You sound ${analysis.emotion.emotion}, based on what you wrote.`}
          </Text>
        </View>
        <Text style={dynamicStyles.confidenceText}>
          {Math.round(analysis.emotion.confidence * 100)}% confidence
          {!useAI && ' (basic detection)'}
        </Text>
        <Text style={dynamicStyles.reflectionText}>
          {analysis.reflection}
        </Text>
      </View>

      {/* Card 2: Suggested Activities */}
      <View style={[dynamicStyles.card, { backgroundColor: '#F1F9FF' }]}>
        <View style={dynamicStyles.cardHeader}>
          <View style={[dynamicStyles.cardIcon, { backgroundColor: colors.accent + '40' }]}>
            <Activity size={20} color={colors.text} strokeWidth={1.5} />
          </View>
          <Text style={dynamicStyles.cardTitle}>Suggested Activities</Text>
        </View>

        {analysis.activities.length > 0 ? (
          <>
            {/* User's Personal Activities */}
            {displayedUserActivities.length > 0 && (
              <View style={dynamicStyles.activitiesSection}>
                <Text style={dynamicStyles.sectionSubtitle}>Your Personal Strategies</Text>
                {displayedUserActivities.map((activity, index) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      dynamicStyles.activityItem,
                      index === displayedUserActivities.length - 1 && displayedAIActivities.length === 0 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => handleActivityToggle(activity)}
                  >
                    {selectedActivities.has(activity.id) ? (
                      <CheckSquare size={20} color={'#181818'} strokeWidth={1.5} />
                    ) : (
                      <Square size={20} color={'#181818'} strokeWidth={1.5} />
                    )}
                    <View style={dynamicStyles.activityContent}>
                      <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
                      <Text style={dynamicStyles.activityDescription}>{activity.description}</Text>
                      <Text style={[dynamicStyles.activityMeta, dynamicStyles.personalActivityMeta]}>
                        {activity.duration} • Your Strategy
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* AI Suggested Activities or Predefined Activities */}
            {displayedAIActivities.length > 0 && (
              <View style={dynamicStyles.activitiesSection}>
                <Text style={dynamicStyles.sectionSubtitle}>
                  {useAI ? 'AI Suggestions' : 'Suggested Activities'}
                </Text>
                {displayedAIActivities.map((activity, index) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      dynamicStyles.activityItem,
                      index === displayedAIActivities.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => handleActivityToggle(activity)}
                  >
                    {selectedActivities.has(activity.id) ? (
                      <CheckSquare size={20} color={'#181818'} strokeWidth={1.5} />
                    ) : (
                      <Square size={20} color={'#181818'} strokeWidth={1.5} />
                    )}
                    <View style={dynamicStyles.activityContent}>
                      <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
                      <Text style={dynamicStyles.activityDescription}>{activity.description}</Text>
                      <Text style={dynamicStyles.activityMeta}>
                        {activity.duration} • {useAI ? 'AI Suggested' : 'Suggested'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyText}>No activities suggested</Text>
            <Text style={dynamicStyles.emptySubtext}>
              Try setting up your emotional toolkit in your profile for personalized suggestions.
            </Text>
          </View>
        )}
      </View>

      {/* Card 3: Positive Reframe - Only show if AI is enabled and distortions exist */}
      {useAI && analysis.distortions.length > 0 && (
        <View style={[dynamicStyles.card, { borderWidth: 1, borderColor: colors.primary, borderRadius: 16 }]}>
          <View style={dynamicStyles.cardHeader}>
            <View style={[dynamicStyles.cardIcon, { backgroundColor: colors.primary + '15' }]}>
              <Sparkles size={20} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={dynamicStyles.cardTitle}>Positive Reframe</Text>
          </View>

          {analysis.distortions.map((distortion, index) => {
            const isExpanded = expandedDistortions.has(distortion.type);
            const severityColor = getSeverityColor(distortion.severity);
            
            return (
              <View 
                key={index} 
                style={dynamicStyles.distortionCard}
              >
                <TouchableOpacity
                  style={dynamicStyles.distortionHeader}
                  onPress={() => handleDistortionToggle(distortion.type)}
                >
                  <View style={[dynamicStyles.severityBadge, { backgroundColor: severityColor }]}>
                    <Text style={dynamicStyles.severityText}>
                      {distortion.severity}
                    </Text>
                  </View>
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
                    <View style={dynamicStyles.factsSection}>
                      <Text style={dynamicStyles.factsTitle}>A different perspective</Text>
                      {distortion.evidence.slice(0, 3).map((fact, factIndex) => (
                        <Text key={factIndex} style={dynamicStyles.factItem}>
                          • {fact}
                        </Text>
                      ))}
                    </View>

                    {/* Reframing Section */}
                    <View style={dynamicStyles.reframeSection}>
                      <Text style={dynamicStyles.reframeTitle}>Reframed Thought:</Text>
                      
                      <TouchableOpacity
                        style={dynamicStyles.aiSuggestionButton}
                        onPress={() => handleGenerateAIReframe(distortion)}
                        disabled={isGeneratingReframe[distortion.type]}
                      >
                        <Lightbulb size={16} color={colors.primary} strokeWidth={1.5} />
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
    </View>
  );
}