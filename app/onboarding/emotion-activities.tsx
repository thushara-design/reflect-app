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
    'Listen to music',
    'Write in journal',
    'Take a warm bath',
    'Practice yoga',
    'Talk to someone',
    'Exercise',
    'Read a book',
    'Watch something funny',
  ];
  
  export default function EmotionActivitiesScreen() {
    const { emotions } = useLocalSearchParams<{ emotions: string }>();
    const emotionList = emotions ? JSON.parse(emotions) : [];
    const [currentIdx, setCurrentIdx] = useState(0);
    const [toolkit, setToolkit] = useState<{ emotion: string; actions: string[] }[]>([]);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [customAction, setCustomAction] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true); // Show by default
    const { colors } = useTheme();
    const { updateEmotionalToolkit, completeOnboarding, userProfile } = useOnboarding();
  
    const currentEmotion = emotionList[currentIdx];
  
    const handleActionToggle = (action: string) => {
      setSelectedActions(prev =>
        prev.includes(action)
          ? prev.filter(a => a !== action)
          : prev.length < 5 ? [...prev, action] : prev // Increased limit to 5
      );
    };
  
    const handleAddCustomAction = () => {
      const trimmed = customAction.trim();
      if (trimmed && !selectedActions.includes(trimmed) && selectedActions.length < 5) {
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
      
      // Normalize emotion name to lowercase for consistency
      const normalizedEmotion = currentEmotion.toLowerCase().trim();
      
      const updatedToolkit = [
        ...toolkit.filter(item => item.emotion !== normalizedEmotion),
        { emotion: normalizedEmotion, actions: [...selectedActions] },
      ];
      setToolkit(updatedToolkit);
      setSelectedActions([]);
      setCustomAction('');
      setShowSuggestions(true);
  
      if (currentIdx < emotionList.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Merge with existing toolkit instead of overwriting
        const existingToolkit = userProfile?.emotionalToolkit || [];
        const mergedToolkit = [...existingToolkit];
        
        // Add or update emotions from onboarding
        updatedToolkit.forEach(newItem => {
          const existingIndex = mergedToolkit.findIndex(
            existing => existing.emotion.toLowerCase().trim() === newItem.emotion.toLowerCase().trim()
          );
          
          if (existingIndex >= 0) {
            // Merge activities, avoiding duplicates
            const existingActions = mergedToolkit[existingIndex].actions;
            const combinedActions = [...existingActions];
            
            newItem.actions.forEach(action => {
              if (!combinedActions.some(existing => 
                existing.toLowerCase().trim() === action.toLowerCase().trim()
              )) {
                combinedActions.push(action);
              }
            });
            
            mergedToolkit[existingIndex] = {
              ...mergedToolkit[existingIndex],
              actions: combinedActions
            };
          } else {
            // Add new emotion
            mergedToolkit.push(newItem);
          }
        });
        
        console.log('Saving merged toolkit:', mergedToolkit);
        await updateEmotionalToolkit(mergedToolkit);
        await completeOnboarding();
        router.replace('/(tabs)');
      }
    };
  
    const handleSkip = () => {
      setSelectedActions([]);
      setCustomAction('');
      setShowSuggestions(true);
      if (currentIdx < emotionList.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        router.replace('/(tabs)');
      }
    };
  
    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
      header: { marginTop: 40, marginBottom: 20 },
      title: { fontSize: 22, fontWeight: '500', color: colors.text, textAlign: 'center' },
      subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 },
      inputContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
      },
      customInput: {
        flex: 1,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        color: colors.text,
      },
      addButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
      },
      addButtonText: {
        color: colors.background,
        fontWeight: '500',
      },
      suggestionToggle: { 
        alignSelf: 'flex-end', 
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
      suggestionToggleText: {
        color: colors.primary,
        fontSize: 14,
      },
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
      selectedChip: {
        backgroundColor: colors.primary + '30',
        borderColor: colors.primary,
      },
      selectedChipText: {
        color: colors.primary,
        fontWeight: '500',
      },
      footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      },
      button: {
        backgroundColor: colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
      },
      buttonDisabled: {
        backgroundColor: colors.border,
      },
      buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
      skip: {
        alignItems: 'center',
        paddingVertical: 10,
      },
      skipText: { color: colors.textSecondary, fontSize: 14 },
      progressText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 10,
      },
    });
  
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.progressText}>
              {currentIdx + 1} of {emotionList.length}
            </Text>
            <Text style={styles.title}>Coping with {currentEmotion}</Text>
            <Text style={styles.subtitle}>Add activities that help you manage this emotion</Text>
  
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.customInput}
                value={customAction}
                onChangeText={setCustomAction}
                placeholder="Add your own activity..."
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={handleAddCustomAction}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddCustomAction}
                disabled={!customAction.trim()}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
  
            <TouchableOpacity style={styles.suggestionToggle} onPress={() => setShowSuggestions(s => !s)}>
              <MaterialIcons 
                name={showSuggestions ? "keyboard-arrow-up" : "lightbulb-outline"} 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.suggestionToggleText}>
                {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
              </Text>
            </TouchableOpacity>
          </View>
  
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
            {/* Selected Activities */}
            {selectedActions.length > 0 && (
              <View style={styles.chipContainer}>
                {selectedActions.map(action => (
                  <View key={action} style={[styles.chip, styles.selectedChip]}>
                    <Text style={[styles.chipText, styles.selectedChipText]}>{action}</Text>
                    <TouchableOpacity onPress={() => handleRemoveAction(action)}>
                      <MaterialIcons name="close" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
  
            {/* Suggested Activities */}
            {showSuggestions && (
              <View style={styles.chipContainer}>
                {PREDEFINED_ACTIONS.map(action => (
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
            )}
          </ScrollView>
        </View>
  
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, selectedActions.length === 0 && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={selectedActions.length === 0}
          >
            <Text style={styles.buttonText}>
              {currentIdx < emotionList.length - 1 ? 'Next' : 'Finish'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skip} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip this emotion</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }