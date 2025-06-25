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
  onActivitySelect: (activityId: string) => void;
  entryText: string;
  userProfile: UserProfile | null;
}

export default function AIAnalysisCards({
  analysis,
  onSaveReframe,
  onActivitySelect,
  entryText,
  userProfile
}: AIAnalysisCardsProps) {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FF9800';
      case 'low': return '#FFA726';
      default: return '#FF9800';
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      gap: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
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
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    emotionSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 16,
    },
    emotionEmoji: {
      fontSize: 32,
    },
    emotionContent: {
      flex: 1,
    },
    emotionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    confidenceText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    reflectionText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontStyle: 'italic',
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
      color: colors.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    activityMeta: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: '500',
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
      fontWeight: '500',
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
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <View style={[dynamicStyles.cardIcon, { backgroundColor: colors.primary + '15' }]}>
            <Brain size={20} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={dynamicStyles.cardTitle}>Emotion Analysis</Text>
        </View>

        <View style={dynamicStyles.emotionSection}>
          <Text style={dynamicStyles.emotionEmoji}>{analysis.emotion.emoji}</Text>
          <View style={dynamicStyles.emotionContent}>
            <Text style={dynamicStyles.emotionText}>
              You sound {analysis.emotion.emotion}, based on what you wrote.
            </Text>
            <Text style={dynamicStyles.confidenceText}>
              {Math.round(analysis.emotion.confidence * 100)}% confidence
            </Text>
            <Text style={dynamicStyles.reflectionText}>
              {analysis.reflection}
            </Text>
          </View>
        </View>
      </View>

      {/* Card 2: Suggested Activities */}
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <View style={[dynamicStyles.cardIcon, { backgroundColor: colors.accent + '40' }]}>
            <Activity size={20} color={colors.text} strokeWidth={1.5} />
          </View>
          <Text style={dynamicStyles.cardTitle}>Suggested Activities</Text>
        </View>

        {allActivities.length > 0 ? (
          allActivities.map((activity, index) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                dynamicStyles.activityItem,
                index === allActivities.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => handleActivityToggle(activity.id)}
            >
              {selectedActivities.has(activity.id) ? (
                <CheckSquare size={20} color={colors.primary} strokeWidth={1.5} />
              ) : (
                <Square size={20} color={colors.border} strokeWidth={1.5} />
              )}
              <View style={dynamicStyles.activityContent}>
                <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
                <Text style={dynamicStyles.activityDescription}>{activity.description}</Text>
                <Text style={dynamicStyles.activityMeta}>
                  {activity.duration} • {activity.category === 'personal' ? 'Your Strategy' : 'AI Suggested'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyText}>No activities suggested</Text>
            <Text style={dynamicStyles.emptySubtext}>
              Try setting up your emotional toolkit in your profile for personalized suggestions.
            </Text>
          </View>
        )}
      </View>

      {/* Card 3: Positive Reframe */}
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <View style={[dynamicStyles.cardIcon, { backgroundColor: colors.primary + '15' }]}>
            <Sparkles size={20} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={dynamicStyles.cardTitle}>Positive Reframe</Text>
        </View>

        {analysis.distortions.length > 0 ? (
          analysis.distortions.map((distortion, index) => {
            const isExpanded = expandedDistortions.has(distortion.type);
            const severityColor = getSeverityColor(distortion.severity);
            
            return (
              <View 
                key={index} 
                style={[
                  dynamicStyles.distortionCard,
                  { borderColor: severityColor + '40' }
                ]}
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
                      <Text style={dynamicStyles.factsTitle}>Let's check some facts:</Text>
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
          })
        ) : (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyText}>No unhelpful patterns detected</Text>
            <Text style={dynamicStyles.emptySubtext}>
              Your thinking shows good balance and perspective in this entry.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}