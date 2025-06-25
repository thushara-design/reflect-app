import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Plus, X, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding, EmotionalToolkitItem } from '@/contexts/OnboardingContext';

const COMMON_EMOTIONS = [
  { name: 'Anxiety', emoji: '😰', color: '#FF9F43' },
  { name: 'Sadness', emoji: '😢', color: '#74B9FF' },
  { name: 'Anger', emoji: '😠', color: '#FF6B6B' },
  { name: 'Guilt', emoji: '😔', color: '#A29BFE' },
  { name: 'Stress', emoji: '😫', color: '#FD79A8' },
  { name: 'Loneliness', emoji: '😞', color: '#FDCB6E' },
];

const PREDEFINED_ACTIONS = [
  'Deep breathing',
  'Listen to music',
  'Take a shower',
  'Go for a walk',
  'Call a friend',
  'Write in journal',
  'Meditation',
  'Exercise',
  'Watch something funny',
  'Drink tea',
  'Pet an animal',
  'Stretch',
];

export default function EmotionalToolkitScreen() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [emotionalToolkit, setEmotionalToolkit] = useState<EmotionalToolkitItem[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const { colors } = useTheme();
  const { updateEmotionalToolkit, completeOnboarding } = useOnboarding();

  const handleEmotionSelect = (emotionName: string) => {
    // Save current emotion's actions if any
    if (selectedEmotion && selectedActions.length > 0) {
      saveCurrentEmotion();
    }
    
    // Load existing actions for this emotion or start fresh
    const existingToolkit = emotionalToolkit.find(item => item.emotion === emotionName);
    setSelectedEmotion(emotionName);
    setSelectedActions(existingToolkit?.actions || []);
    setShowCustomInput(false);
    setCustomAction('');
  };

  const saveCurrentEmotion = () => {
    if (!selectedEmotion || selectedActions.length === 0) return;
    
    const updatedToolkit = emotionalToolkit.filter(item => item.emotion !== selectedEmotion);
    updatedToolkit.push({
      emotion: selectedEmotion,
      actions: [...selectedActions]
    });
    setEmotionalToolkit(updatedToolkit);
  };

  const handleActionToggle = (action: string) => {
    setSelectedActions(prev => {
      if (prev.includes(action)) {
        return prev.filter(a => a !== action);
      } else if (prev.length < 3) { // Limit to 3 actions per emotion
        return [...prev, action];
      }
      return prev;
    });
  };

  const handleAddCustomAction = () => {
    if (customAction.trim() && selectedActions.length < 3) {
      setSelectedActions(prev => [...prev, customAction.trim()]);
      setCustomAction('');
      setShowCustomInput(false);
    }
  };

  const handleFinish = async () => {
    // Save current emotion if any
    if (selectedEmotion && selectedActions.length > 0) {
      saveCurrentEmotion();
    }

    if (emotionalToolkit.length === 0 && (!selectedEmotion || selectedActions.length === 0)) {
      Alert.alert('Setup Required', 'Please set up at least one emotion with coping actions.');
      return;
    }

    // Include current emotion if not saved yet
    let finalToolkit = [...emotionalToolkit];
    if (selectedEmotion && selectedActions.length > 0) {
      const existingIndex = finalToolkit.findIndex(item => item.emotion === selectedEmotion);
      if (existingIndex >= 0) {
        finalToolkit[existingIndex] = { emotion: selectedEmotion, actions: [...selectedActions] };
      } else {
        finalToolkit.push({ emotion: selectedEmotion, actions: [...selectedActions] });
      }
    }

    await updateEmotionalToolkit(finalToolkit);
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    router.back();
  };

  const getEmotionColor = (emotionName: string) => {
    return COMMON_EMOTIONS.find(e => e.name === emotionName)?.color || colors.primary;
  };

  const getEmotionEmoji = (emotionName: string) => {
    return COMMON_EMOTIONS.find(e => e.name === emotionName)?.emoji || '😐';
  };

  const isEmotionConfigured = (emotionName: string) => {
    return emotionalToolkit.some(item => item.emotion === emotionName) || 
           (selectedEmotion === emotionName && selectedActions.length > 0);
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
    },
    stepIndicator: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '300',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 24,
    },
    emotionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 30,
    },
    emotionCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    emotionCardSelected: {
      borderWidth: 2,
    },
    emotionCardConfigured: {
      backgroundColor: colors.primary + '10',
    },
    emotionEmoji: {
      fontSize: 24,
      marginBottom: 8,
    },
    emotionName: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '400',
      textAlign: 'center',
    },
    actionsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    actionChip: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    actionChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionChipText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '300',
    },
    actionChipTextSelected: {
      color: colors.background,
    },
    addCustomButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 4,
    },
    addCustomText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    customInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    customInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.text,
    },
    customInputButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 8,
    },
    finishButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    finishButtonText: {
      fontSize: 16,
      color: colors.background,
      fontWeight: '400',
    },
    selectedEmotionIndicator: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={dynamicStyles.stepIndicator}>Step 2 of 2</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={dynamicStyles.title}>Emotional Support Kit</Text>
        <Text style={dynamicStyles.subtitle}>
          Select emotions and choose 1-2 coping actions for each
        </Text>

        <View style={dynamicStyles.emotionsGrid}>
          {COMMON_EMOTIONS.map((emotion) => (
            <TouchableOpacity
              key={emotion.name}
              style={[
                dynamicStyles.emotionCard,
                selectedEmotion === emotion.name && {
                  ...dynamicStyles.emotionCardSelected,
                  borderColor: emotion.color,
                },
                isEmotionConfigured(emotion.name) && dynamicStyles.emotionCardConfigured,
              ]}
              onPress={() => handleEmotionSelect(emotion.name)}
            >
              <Text style={dynamicStyles.emotionEmoji}>{emotion.emoji}</Text>
              <Text style={dynamicStyles.emotionName}>{emotion.name}</Text>
              {isEmotionConfigured(emotion.name) && (
                <Check size={16} color={colors.primary} strokeWidth={2} style={{ marginTop: 4 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedEmotion && (
          <>
            <Text style={dynamicStyles.selectedEmotionIndicator}>
              Setting up coping actions for {getEmotionEmoji(selectedEmotion)} {selectedEmotion} ({selectedActions.length}/3 selected)
            </Text>

            <View style={dynamicStyles.actionsSection}>
              <Text style={dynamicStyles.sectionTitle}>Choose helpful actions:</Text>
              
              <View style={dynamicStyles.actionsGrid}>
                {PREDEFINED_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action}
                    style={[
                      dynamicStyles.actionChip,
                      selectedActions.includes(action) && dynamicStyles.actionChipSelected,
                    ]}
                    onPress={() => handleActionToggle(action)}
                    disabled={!selectedActions.includes(action) && selectedActions.length >= 3}
                  >
                    <Text style={[
                      dynamicStyles.actionChipText,
                      selectedActions.includes(action) && dynamicStyles.actionChipTextSelected,
                    ]}>
                      {action}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {!showCustomInput && selectedActions.length < 3 && (
                  <TouchableOpacity
                    style={dynamicStyles.addCustomButton}
                    onPress={() => setShowCustomInput(true)}
                  >
                    <Plus size={16} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={dynamicStyles.addCustomText}>Add custom</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showCustomInput && (
                <View style={dynamicStyles.customInputContainer}>
                  <TextInput
                    style={dynamicStyles.customInput}
                    placeholder="Enter custom action..."
                    placeholderTextColor={colors.textSecondary}
                    value={customAction}
                    onChangeText={setCustomAction}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleAddCustomAction}
                  />
                  <TouchableOpacity
                    style={dynamicStyles.customInputButton}
                    onPress={handleAddCustomAction}
                  >
                    <Check size={16} color={colors.background} strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomAction('');
                    }}
                  >
                    <X size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        <TouchableOpacity style={dynamicStyles.finishButton} onPress={handleFinish}>
          <Text style={dynamicStyles.finishButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: 24,
  },
});