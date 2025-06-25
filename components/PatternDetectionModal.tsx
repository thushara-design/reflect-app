import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { X, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface PatternDetectionModalProps {
  visible: boolean;
  onClose: () => void;
  patternType: string;
  explanation: string;
  challengingFacts: string[];
  onSaveReframe: (reframedThought: string) => void;
}

export default function PatternDetectionModal({
  visible,
  onClose,
  patternType,
  explanation,
  challengingFacts,
  onSaveReframe
}: PatternDetectionModalProps) {
  const [reframedThought, setReframedThought] = useState('');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const { colors } = useTheme();

  const aiSuggestion = "Consider that this situation might have multiple perspectives. What evidence supports a more balanced view?";

  const handleSave = () => {
    if (reframedThought.trim()) {
      onSaveReframe(reframedThought);
      setReframedThought('');
      onClose();
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
    headerTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    patternCard: {
      backgroundColor: '#FF6B6B10',
      borderWidth: 1,
      borderColor: '#FF6B6B',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    patternHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    patternTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: '#FF6B6B',
    },
    patternExplanation: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    factsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 12,
    },
    factItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    reframeSection: {
      marginBottom: 20,
    },
    textInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
    aiSuggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      marginBottom: 12,
    },
    aiSuggestionText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '400',
    },
    aiSuggestion: {
      backgroundColor: colors.primary + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    aiSuggestionContent: {
      fontSize: 14,
      color: colors.text,
      fontStyle: 'italic',
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      color: colors.background,
      fontWeight: '400',
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
          <Text style={dynamicStyles.headerTitle}>Pattern Detected</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.content}>
          {/* Pattern Alert */}
          <View style={dynamicStyles.patternCard}>
            <View style={dynamicStyles.patternHeader}>
              <AlertTriangle size={20} color="#FF6B6B" strokeWidth={1.5} />
              <Text style={dynamicStyles.patternTitle}>Unhelpful pattern detected</Text>
            </View>
            <Text style={dynamicStyles.patternExplanation}>
              {patternType}: {explanation}
            </Text>
          </View>

          {/* Challenging Facts */}
          <View style={dynamicStyles.factsSection}>
            <Text style={dynamicStyles.sectionTitle}>Let's check some facts:</Text>
            {challengingFacts.map((fact, index) => (
              <Text key={index} style={dynamicStyles.factItem}>• {fact}</Text>
            ))}
          </View>

          {/* Reframe Section */}
          <View style={dynamicStyles.reframeSection}>
            <Text style={dynamicStyles.sectionTitle}>Reframe this thought:</Text>
            
            <TouchableOpacity
              style={dynamicStyles.aiSuggestionButton}
              onPress={() => setShowAISuggestion(!showAISuggestion)}
            >
              <Lightbulb size={16} color={colors.primary} strokeWidth={1.5} />
              <Text style={dynamicStyles.aiSuggestionText}>
                {showAISuggestion ? 'Hide' : 'Show'} AI suggestion
              </Text>
            </TouchableOpacity>

            {showAISuggestion && (
              <View style={dynamicStyles.aiSuggestion}>
                <Text style={dynamicStyles.aiSuggestionContent}>{aiSuggestion}</Text>
              </View>
            )}

            <TextInput
              style={dynamicStyles.textInput}
              placeholder="Write a more balanced version of this thought..."
              placeholderTextColor={colors.textSecondary}
              value={reframedThought}
              onChangeText={setReframedThought}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={dynamicStyles.saveButton} onPress={handleSave}>
              <Text style={dynamicStyles.saveButtonText}>Save to Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}