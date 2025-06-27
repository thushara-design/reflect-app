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
  import { useState, useEffect } from 'react';
  import { useLocalSearchParams, router } from 'expo-router';
  import { useTheme } from '@/contexts/ThemeContext';
  import { useOnboarding } from '@/contexts/OnboardingContext';
  import { MaterialIcons } from '@expo/vector-icons';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
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
  
  // Utility to capitalize first letter
  function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  export default function EmotionActivitiesScreen() {
    const { emotions } = useLocalSearchParams<{ emotions: string }>();
    const emotionList = emotions ? JSON.parse(emotions) : [];
    const [currentIdx, setCurrentIdx] = useState(0);
    // Use a mapping to track all selections
    const [allSelections, setAllSelections] = useState<{ [emotion: string]: string[] }>({});
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [customAction, setCustomAction] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false); // Hide by default
    const { colors } = useTheme();
    const { updateEmotionalToolkit, completeOnboarding, userProfile, setUserProfile } = useOnboarding();
  
    const currentEmotion = emotionList[currentIdx];
  
    // Load previous selections for this emotion when changing emotion
    useEffect(() => {
      const normalizedEmotion = capitalizeFirst(currentEmotion.toLowerCase().trim());
      setSelectedActions(allSelections[normalizedEmotion] || []);
      setShowSuggestions(false); // Hide suggestions for each new emotion
    }, [currentIdx]);
  
    const handleActionToggle = (action: string) => {
      setSelectedActions(prev => {
        const next = prev.includes(action)
          ? prev.filter(a => a !== action)
          : prev.length < 5 ? [...prev, action] : prev;
        console.log(`DEBUG: Toggled action '${action}' for emotion '${currentEmotion}'. New selectedActions:`, next);
        return next;
      });
    };
  
    const handleAddCustomAction = () => {
      const trimmed = customAction.trim();
      if (trimmed && !selectedActions.includes(trimmed) && selectedActions.length < 5) {
        setSelectedActions(prev => {
          const next = [...prev, trimmed];
          console.log(`DEBUG: Added custom action '${trimmed}' for emotion '${currentEmotion}'. New selectedActions:`, next);
          return next;
        });
        setCustomAction('');
      }
    };
  
    const handleRemoveAction = (action: string) => {
      setSelectedActions(prev => {
        const next = prev.filter(a => a !== action);
        console.log(`DEBUG: Removed action '${action}' for emotion '${currentEmotion}'. New selectedActions:`, next);
        return next;
      });
    };
  
    const saveCurrentSelection = (selections: { [emotion: string]: string[] }) => {
      const normalizedEmotion = capitalizeFirst(currentEmotion.toLowerCase().trim());
      return { ...selections, [normalizedEmotion]: [...selectedActions] };
    };
  
    const handleNext = async () => {
      if (selectedActions.length === 0) {
        Alert.alert('Please select at least one activity.');
        return;
      }
      // Update allSelections with current
      const newSelections = saveCurrentSelection(allSelections);
      setAllSelections(newSelections);
      console.log(`DEBUG: Clicked NEXT for emotion '${currentEmotion}'. All selections so far:`, newSelections);
      setSelectedActions([]);
      setCustomAction('');
      setShowSuggestions(false);
  
      if (currentIdx < emotionList.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Build toolkit from allSelections
        const finalToolkit = Object.entries(newSelections).map(([emotion, actions]) => ({
          emotion,
          actions,
        }));
        // Save the full, merged user profile
        const updatedProfile = {
          name: userProfile?.name || '',
          emotionalToolkit: finalToolkit,
          hasCompletedOnboarding: true,
          useAI: userProfile?.useAI ?? true,
        };
        setUserProfile && setUserProfile(updatedProfile);
        await AsyncStorage.setItem('@reflect_user_profile', JSON.stringify(updatedProfile));
        console.log('DEBUG: Saved full profile in onboarding:', updatedProfile);
        router.replace('/(tabs)/add');
      }
    };
  
    const handleSkip = async () => {
      // Save current selection (even if empty)
      const newSelections = saveCurrentSelection(allSelections);
      setAllSelections(newSelections);
      console.log(`DEBUG: Clicked SKIP for emotion '${currentEmotion}'. All selections so far:`, newSelections);
      setSelectedActions([]);
      setCustomAction('');
      setShowSuggestions(false); // Hide suggestions for each new emotion
      if (currentIdx < emotionList.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Build toolkit from allSelections
        const finalToolkit = Object.entries(newSelections).map(([emotion, actions]) => ({
          emotion,
          actions,
        }));
        // Save the full, merged user profile
        const updatedProfile = {
          name: userProfile?.name || '',
          emotionalToolkit: finalToolkit,
          hasCompletedOnboarding: true,
          useAI: userProfile?.useAI ?? true,
        };
        setUserProfile && setUserProfile(updatedProfile);
        await AsyncStorage.setItem('@reflect_user_profile', JSON.stringify(updatedProfile));
        console.log('DEBUG: Saved full profile in onboarding:', updatedProfile);
        router.replace('/(tabs)/add');
      }
    };
  
    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
      header: { marginTop: 40, marginBottom: 20 },
      title: {
        fontSize: 28,
        fontWeight: '300',
        color: '#181818',
        textAlign: 'left',
        marginBottom: 8,
      },
      subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'left',
        marginBottom: 30,
        lineHeight: 24,
      },
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
        color: '#222',
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
      chipText: { fontSize: 14, color: '#222', marginRight: 6 },
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
      stepIndicator: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '300',
        textAlign: 'left',
        marginBottom: 20,
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
            <Text style={styles.subtitle}>
              Add activities that help you manage this emotion. When this emotion is detected, we'll gently suggest these activities to support you.
            </Text>
  
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
  
            {/* Add white space between selected and suggested activities */}
            {selectedActions.length > 0 && showSuggestions && (
              <View style={{ height: 24 }} />
            )}
  
            {/* Suggested Activities */}
            {showSuggestions && (
              <View style={styles.chipContainer}>
                {PREDEFINED_ACTIONS.filter(action => !selectedActions.includes(action)).map(action => (
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
                {/* If all suggestions are selected, show a message */}
                {PREDEFINED_ACTIONS.filter(action => !selectedActions.includes(action)).length === 0 && (
                  <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}>All suggestions selected</Text>
                )}
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