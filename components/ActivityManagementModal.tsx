import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { X, Plus, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding, EmotionalToolkitItem } from '@/contexts/OnboardingContext';

interface ActivityManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

const emotions = [
  { name: 'Anxiety', emoji: '😰', color: '#FF9F43' },
  { name: 'Sadness', emoji: '😢', color: '#74B9FF' },
  { name: 'Anger', emoji: '😠', color: '#FF6B6B' },
  { name: 'Stress', emoji: '😫', color: '#FD79A8' },
  { name: 'Frustration', emoji: '😤', color: '#A29BFE' },
  { name: 'Loneliness', emoji: '😞', color: '#FDCB6E' },
];

export default function ActivityManagementModal({ visible, onClose }: ActivityManagementModalProps) {
  const { colors } = useTheme();
  const { userProfile, updateEmotionalToolkit } = useOnboarding();
  
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [editingActivity, setEditingActivity] = useState<{ emotion: string; index: number; text: string } | null>(null);

  const getActivitiesForEmotion = (emotionName: string) => {
    const toolkit = userProfile?.emotionalToolkit || [];
    const emotionData = toolkit.find(item => item.emotion.toLowerCase() === emotionName.toLowerCase());
    return emotionData?.actions || [];
  };

  const handleAddActivity = async () => {
    if (!selectedEmotion || !newActivity.trim()) return;

    const currentToolkit = userProfile?.emotionalToolkit || [];
    const updatedToolkit = [...currentToolkit];
    
    const existingIndex = updatedToolkit.findIndex(item => 
      item.emotion.toLowerCase() === selectedEmotion.toLowerCase()
    );

    if (existingIndex >= 0) {
      updatedToolkit[existingIndex].actions.push(newActivity.trim());
    } else {
      updatedToolkit.push({
        emotion: selectedEmotion,
        actions: [newActivity.trim()]
      });
    }

    await updateEmotionalToolkit(updatedToolkit);
    setNewActivity('');
    setShowAddActivity(false);
  };

  const handleDeleteActivity = async (emotionName: string, activityIndex: number) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const currentToolkit = userProfile?.emotionalToolkit || [];
            const updatedToolkit = currentToolkit.map(item => {
              if (item.emotion.toLowerCase() === emotionName.toLowerCase()) {
                return {
                  ...item,
                  actions: item.actions.filter((_, index) => index !== activityIndex)
                };
              }
              return item;
            }).filter(item => item.actions.length > 0);

            await updateEmotionalToolkit(updatedToolkit);
          }
        }
      ]
    );
  };

  const handleEditActivity = async () => {
    if (!editingActivity || !editingActivity.text.trim()) return;

    const currentToolkit = userProfile?.emotionalToolkit || [];
    const updatedToolkit = currentToolkit.map(item => {
      if (item.emotion.toLowerCase() === editingActivity.emotion.toLowerCase()) {
        const updatedActions = [...item.actions];
        updatedActions[editingActivity.index] = editingActivity.text.trim();
        return { ...item, actions: updatedActions };
      }
      return item;
    });

    await updateEmotionalToolkit(updatedToolkit);
    setEditingActivity(null);
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
      fontSize: 20,
      fontWeight: '400',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    emotionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginVertical: 20,
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
    selectedEmotionCard: {
      borderWidth: 2,
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
    activitiesSection: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 16,
    },
    activityItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    activityText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '300',
    },
    activityActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
    },
    addButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
      marginTop: 16,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '400',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '300',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    textInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '400',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '300',
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
          <Text style={dynamicStyles.headerTitle}>Manage Activities</Text>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.emotionsGrid}>
            {emotions.map((emotion) => (
              <TouchableOpacity
                key={emotion.name}
                style={[
                  dynamicStyles.emotionCard,
                  selectedEmotion === emotion.name && {
                    ...dynamicStyles.selectedEmotionCard,
                    borderColor: emotion.color,
                  }
                ]}
                onPress={() => setSelectedEmotion(emotion.name)}
              >
                <Text style={dynamicStyles.emotionEmoji}>{emotion.emoji}</Text>
                <Text style={dynamicStyles.emotionName}>{emotion.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedEmotion && (
            <View style={dynamicStyles.activitiesSection}>
              <Text style={dynamicStyles.sectionTitle}>
                Activities for {selectedEmotion}
              </Text>

              {getActivitiesForEmotion(selectedEmotion).length === 0 ? (
                <View style={dynamicStyles.emptyState}>
                  <Text style={dynamicStyles.emptyText}>
                    No activities added yet for {selectedEmotion.toLowerCase()}.{'\n'}
                    Add some helpful coping activities below.
                  </Text>
                </View>
              ) : (
                getActivitiesForEmotion(selectedEmotion).map((activity, index) => (
                  <View key={index} style={dynamicStyles.activityItem}>
                    <Text style={dynamicStyles.activityText}>{activity}</Text>
                    <View style={dynamicStyles.activityActions}>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => setEditingActivity({
                          emotion: selectedEmotion,
                          index,
                          text: activity
                        })}
                      >
                        <Edit3 size={16} color={colors.textSecondary} strokeWidth={1.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={dynamicStyles.actionButton}
                        onPress={() => handleDeleteActivity(selectedEmotion, index)}
                      >
                        <Trash2 size={16} color={colors.accent} strokeWidth={1.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity
                style={dynamicStyles.addButton}
                onPress={() => setShowAddActivity(true)}
              >
                <Plus size={20} color={colors.background} strokeWidth={1.5} />
                <Text style={dynamicStyles.addButtonText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Add Activity Modal */}
        <Modal
          visible={showAddActivity}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddActivity(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>Add New Activity</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={newActivity}
                onChangeText={setNewActivity}
                placeholder="Enter a helpful activity..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
                multiline
              />
              <View style={dynamicStyles.modalButtons}>
                <TouchableOpacity 
                  style={[dynamicStyles.modalButton, dynamicStyles.secondaryButton]}
                  onPress={() => {
                    setShowAddActivity(false);
                    setNewActivity('');
                  }}
                >
                  <Text style={dynamicStyles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[dynamicStyles.modalButton, dynamicStyles.primaryButton]}
                  onPress={handleAddActivity}
                >
                  <Text style={dynamicStyles.primaryButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Activity Modal */}
        <Modal
          visible={!!editingActivity}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingActivity(null)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>Edit Activity</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={editingActivity?.text || ''}
                onChangeText={(text) => setEditingActivity(prev => 
                  prev ? { ...prev, text } : null
                )}
                placeholder="Enter activity..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
                multiline
              />
              <View style={dynamicStyles.modalButtons}>
                <TouchableOpacity 
                  style={[dynamicStyles.modalButton, dynamicStyles.secondaryButton]}
                  onPress={() => setEditingActivity(null)}
                >
                  <Text style={dynamicStyles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[dynamicStyles.modalButton, dynamicStyles.primaryButton]}
                  onPress={handleEditActivity}
                >
                  <Text style={dynamicStyles.primaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}