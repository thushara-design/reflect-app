import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
  } from 'react-native';
  import { useState } from 'react';
  import { useLocalSearchParams, router } from 'expo-router';
  import { useTheme } from '@/contexts/ThemeContext';
  import { useOnboarding } from '@/contexts/OnboardingContext';
  import { MaterialIcons } from '@expo/vector-icons';
  
  const PREDEFINED_ACTIONS = [
    'Deep breathing',
    'Go for a walk',
    'Meditation',
    'Call a friend',
  ];
  
  export default function EmotionActivitiesScreen() {
    const { emotions } = useLocalSearchParams<{ emotions: string }>();
    const emotionList = emotions ? JSON.parse(emotions) : [];
    const [currentIdx, setCurrentIdx] = useState(0);
    const [toolkit, setToolkit] = useState<{ emotion: string; actions: string[] }[]>([]);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [customAction, setCustomAction] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false); // Hidden by default
    const { colors } = useTheme();
    const { updateEmotionalToolkit, completeOnboarding } = useOnboarding();
  
    const currentEmotion = emotionList[currentIdx];
  
    const handleActionToggle = (action: string) => {
      setSelectedActions(prev =>
        prev.includes(action)
          ? prev.filter(a => a !== action)
          : prev.length < 3 ? [...prev, action] : prev
      );
    };
  
    const handleAddCustomAction = () => {
      const trimmed = customAction.trim();
      if (trimmed && !selectedActions.includes(trimmed) && selectedActions.length < 3) {
        setSelectedActions(prev => [...prev, trimmed]);
        setCustomAction('');
      }
    };
  
    const handleRemoveAction = (action: string) => {
      setSelectedActions(prev => prev.filter(a => a !== action));
    };
  
    const handleNext = async () => {
      if (selectedActions.length === 0) {
        Alert.alert('Please select at least one activity.');
        return;
      }
      const updatedToolkit = [
        ...toolkit.filter(item => item.emotion !== currentEmotion),
        { emotion: currentEmotion, actions: [...selectedActions] },
      ];
      setToolkit(updatedToolkit);
      setSelectedActions([]);
      setCustomAction('');
      setShowSuggestions(false);
  
      if (currentIdx < emotionList.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        await updateEmotionalToolkit(updatedToolkit);
        await completeOnboarding();
        router.replace('/(tabs)');
      }
    };
  
    const handleSkip = () => {
      setSelectedActions([]);
      setCustomAction('');
      setShowSuggestions(false);
      if (currentIdx < emotionList.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        router.replace('/(tabs)');
      }
    };
  
    const progress = (emotionList.length > 0) ? (currentIdx + 1) / emotionList.length : 0;
    const styles = StyleSheet.create({
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
      progressBarContainer: { height: 8, backgroundColor: colors.background, borderRadius: 4, marginHorizontal: 24, marginBottom: 24, marginTop: 8, overflow: 'hidden' },
      progressBar: { height: 8, backgroundColor: colors.primary, width: `${progress * 100}%`, borderRadius: 4 },
      container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
      title: { fontSize: 28, fontWeight: '300', color: colors.text, textAlign: 'center', marginBottom: 8 },
      subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20, lineHeight: 24 },
      customInput: {
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        color: colors.text,
        marginBottom: 12,
      },
      suggestionToggle: { alignSelf: 'flex-end', marginBottom: 12 },
      chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
      },
      chipSelected: {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
      },
      chipText: { fontSize: 14, color: colors.text, marginRight: 6 },
      footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      },
      button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
      },
      buttonText: { color: '#fff', fontSize: 16, fontWeight: '400' },
      skip: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 8,
      },
      skipText: { color: colors.textSecondary, fontSize: 14, fontWeight: '400' },
    });
  
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            {/* everything inside stays the same */}
            <View style={styles.header}>
              <View style={{ width: 24 }} />
              <Text style={styles.stepIndicator}>Step 2 of 2</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>Coping with {currentEmotion}</Text>
              <Text style={styles.subtitle}>
                Pick up to 3 actions that help you manage this emotion
              </Text>
      
              <TextInput
                style={styles.customInput}
                value={customAction}
                onChangeText={setCustomAction}
                placeholder="Add your own..."
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={handleAddCustomAction}
                returnKeyType="done"
              />
      
              <TouchableOpacity
                style={styles.suggestionToggle}
                onPress={() => setShowSuggestions((s) => !s)}
              >
                <MaterialIcons name="lightbulb-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
      
              {showSuggestions && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
                  <View style={styles.chipContainer}>
                    {PREDEFINED_ACTIONS.map((action) => (
                      <TouchableOpacity
                        key={action}
                        style={[
                          styles.chip,
                          selectedActions.includes(action) && styles.chipSelected,
                        ]}
                        onPress={() => handleActionToggle(action)}
                      >
                        <Text style={styles.chipText}>{action}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
      
              {selectedActions.length > 0 && (
                <View style={styles.chipContainer}>
                  {selectedActions.map((action) => (
                    <View key={action} style={[styles.chip, styles.chipSelected]}>
                      <Text style={styles.chipText}>{action}</Text>
                      <TouchableOpacity onPress={() => handleRemoveAction(action)}>
                        <MaterialIcons name="close" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
      
            <View style={styles.footer}>
              <TouchableOpacity style={styles.skip} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip this emotion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                  {currentIdx < emotionList.length - 1 ? 'Next' : 'Finish'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      );      
  }
  