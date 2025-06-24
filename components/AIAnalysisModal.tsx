import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';
import { X, Sparkles, SquareCheck as CheckSquare, Square } from 'lucide-react-native';
import { AIAnalysisResult, CognitiveDistortion } from '@/services/aiService';

interface AIAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: AIAnalysisResult | null;
  onSaveReframe: (originalThought: string, reframedThought: string) => void;
  onActivitySelect: (activityId: string) => void;
}

export default function AIAnalysisModal({ 
  visible, 
  onClose, 
  analysis,
  onSaveReframe,
  onActivitySelect
}: AIAnalysisModalProps) {
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [reframedThoughts, setReframedThoughts] = useState<Record<string, string>>({});
  const [showReframing, setShowReframing] = useState<Record<string, boolean>>({});

  if (!analysis) return null;

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

  const handleReframeSave = (distortion: CognitiveDistortion) => {
    const reframedText = reframedThoughts[distortion.type];
    if (reframedText?.trim()) {
      onSaveReframe(distortion.description, reframedText);
      setShowReframing(prev => ({ ...prev, [distortion.type]: false }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={24} color="#A5B8C8" strokeWidth={1.5} />
            <Text style={styles.headerTitle}>AI Analysis</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#2A2A2A" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotional Tone Detected</Text>
            <View style={styles.emotionCard}>
              <Text style={styles.emotionEmoji}>{analysis.emotion.emoji}</Text>
              <View style={styles.emotionInfo}>
                <Text style={styles.emotionName}>{analysis.emotion.emotion}</Text>
                <Text style={styles.emotionConfidence}>
                  {Math.round(analysis.emotion.confidence * 100)}% confidence
                </Text>
              </View>
            </View>
          </View>

          {analysis.activities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggested Activities</Text>
              <Text style={styles.sectionSubtitle}>
                Based on your emotional state, here are some activities that might help:
              </Text>
              {analysis.activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  onPress={() => handleActivityToggle(activity.id)}
                >
                  <View style={styles.activityHeader}>
                    {selectedActivities.has(activity.id) ? (
                      <CheckSquare size={20} color="#A5B8C8" strokeWidth={1.5} />
                    ) : (
                      <Square size={20} color="#EAEAEA" strokeWidth={1.5} />
                    )}
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDuration}>{activity.duration}</Text>
                  </View>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {analysis.distortions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Unhelpful Thinking Patterns Detected</Text>
              {analysis.distortions.map((distortion, index) => (
                <View key={index} style={styles.distortionCard}>
                  <Text style={styles.distortionType}>"{distortion.type}"</Text>
                  <Text style={styles.distortionDescription}>{distortion.description}</Text>
                  
                  <Text style={styles.evidenceTitle}>Let's check some facts:</Text>
                  {distortion.evidence.map((fact, factIndex) => (
                    <Text key={factIndex} style={styles.evidenceItem}>• {fact}</Text>
                  ))}

                  <TouchableOpacity
                    style={styles.reframeButton}
                    onPress={() => handleReframeToggle(distortion.type)}
                  >
                    <Text style={styles.reframeButtonText}>
                      {showReframing[distortion.type] ? 'Hide Reframing' : 'Reframe This Thought'}
                    </Text>
                  </TouchableOpacity>

                  {showReframing[distortion.type] && (
                    <View style={styles.reframingSection}>
                      <Text style={styles.reframingPrompt}>{distortion.reframingPrompt}</Text>
                      <TextInput
                        style={styles.reframingInput}
                        placeholder="Write a more balanced version of this thought..."
                        placeholderTextColor="#A5B8C8"
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
                          style={styles.saveReframeButton}
                          onPress={() => handleReframeSave(distortion)}
                        >
                          <Text style={styles.saveReframeText}>Save to Entry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.remindLaterButton}
                          onPress={() => {/* Handle remind later */}}
                        >
                          <Text style={styles.remindLaterText}>Remind Me Later</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2A2A2A',
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
    color: '#2A2A2A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#A5B8C8',
    marginBottom: 16,
    lineHeight: 20,
  },
  emotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 16,
    gap: 16,
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
    color: '#2A2A2A',
    textTransform: 'capitalize',
  },
  emotionConfidence: {
    fontSize: 12,
    color: '#A5B8C8',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#2A2A2A',
  },
  activityDuration: {
    fontSize: 12,
    color: '#A5B8C8',
  },
  activityDescription: {
    fontSize: 14,
    color: '#A5B8C8',
    lineHeight: 20,
    marginLeft: 32,
  },
  distortionCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  distortionType: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2A2A2A',
    marginBottom: 8,
  },
  distortionDescription: {
    fontSize: 14,
    color: '#A5B8C8',
    marginBottom: 12,
    lineHeight: 20,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2A2A2A',
    marginBottom: 8,
  },
  evidenceItem: {
    fontSize: 14,
    color: '#A5B8C8',
    marginBottom: 4,
    lineHeight: 20,
  },
  reframeButton: {
    backgroundColor: '#A5B8C8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  reframeButtonText: {
    fontSize: 14,
    color: '#FAFAFA',
    fontWeight: '400',
  },
  reframingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  reframingPrompt: {
    fontSize: 14,
    color: '#2A2A2A',
    marginBottom: 12,
    fontWeight: '400',
  },
  reframingInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2A2A2A',
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
    backgroundColor: '#A5B8C8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveReframeText: {
    fontSize: 14,
    color: '#FAFAFA',
    fontWeight: '400',
  },
  remindLaterButton: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  remindLaterText: {
    fontSize: 14,
    color: '#A5B8C8',
    fontWeight: '400',
  },
});