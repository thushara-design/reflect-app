import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ReflectionResultsPage() {
  const { emotion, confidence, reflection, activities } = useLocalSearchParams<{
    emotion?: string;
    confidence?: string;
    reflection?: string;
    activities?: string;
  }>();
  
  const { colors } = useTheme();
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  // Parse activities from string
  const activityList = activities ? JSON.parse(activities) : [];
  
  // Mock AI suggestion
  const aiSuggestion = {
    id: 'ai-meditation',
    title: '💡 Mindful Breathing',
    description: 'AI suggests a 5-minute breathing exercise based on your current emotional state',
    duration: '5 minutes',
    isAI: true
  };

  const handleActivityToggle = (activityId: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const handleBack = () => {
    router.back();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
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
      letterSpacing: -0.3,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    emotionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      margin: 24,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    emotionEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    emotionText: {
      fontSize: 24,
      fontWeight: '400',
      color: colors.text,
      textTransform: 'capitalize',
      marginBottom: 8,
    },
    confidenceText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    reflectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reflectionTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    reflectionText: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginHorizontal: 24,
      marginBottom: 16,
    },
    activityCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aiActivityCard: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
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
      color: colors.text,
    },
    activityDuration: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    activityDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginLeft: 32,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        
        <Text style={dynamicStyles.headerTitle}>Reflection Results</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emotion Display */}
        <View style={dynamicStyles.emotionCard}>
          <Text style={dynamicStyles.emotionEmoji}>
            {emotion === 'happy' ? '😊' : 
             emotion === 'sad' ? '😢' : 
             emotion === 'anxious' ? '😰' : 
             emotion === 'angry' ? '😠' : 
             emotion === 'stressed' ? '😫' : '😐'}
          </Text>
          <Text style={dynamicStyles.emotionText}>{emotion || 'neutral'}</Text>
          <Text style={dynamicStyles.confidenceText}>
            {confidence ? `${confidence}% confidence` : '75% confidence'}
          </Text>
        </View>

        {/* AI Reflection */}
        <View style={dynamicStyles.reflectionCard}>
          <View style={styles.reflectionTitleContainer}>
            <Sparkles size={20} color={colors.primary} strokeWidth={1.5} />
            <Text style={dynamicStyles.reflectionTitle}>AI Reflection</Text>
          </View>
          <Text style={dynamicStyles.reflectionText}>
            {reflection || "Your entry shows emotional awareness and self-reflection. It's healthy to acknowledge these feelings and seek ways to process them constructively."}
          </Text>
        </View>

        {/* Suggested Activities */}
        <Text style={dynamicStyles.sectionTitle}>Suggested Activities</Text>
        
        {/* User's selected activities from onboarding */}
        {activityList.map((activity: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={dynamicStyles.activityCard}
            onPress={() => handleActivityToggle(activity.id || index.toString())}
          >
            <View style={dynamicStyles.activityHeader}>
              {selectedActivities.has(activity.id || index.toString()) ? (
                <CheckCircle size={20} color={colors.primary} strokeWidth={1.5} />
              ) : (
                <View style={[styles.checkbox, { borderColor: colors.border }]} />
              )}
              <Text style={dynamicStyles.activityTitle}>{activity.title}</Text>
              <Text style={dynamicStyles.activityDuration}>{activity.duration}</Text>
            </View>
            <Text style={dynamicStyles.activityDescription}>{activity.description}</Text>
          </TouchableOpacity>
        ))}

        {/* AI Suggestion */}
        <TouchableOpacity
          style={[dynamicStyles.activityCard, dynamicStyles.aiActivityCard]}
          onPress={() => handleActivityToggle(aiSuggestion.id)}
        >
          <View style={dynamicStyles.activityHeader}>
            {selectedActivities.has(aiSuggestion.id) ? (
              <CheckCircle size={20} color={colors.primary} strokeWidth={1.5} />
            ) : (
              <View style={[styles.checkbox, { borderColor: colors.primary }]} />
            )}
            <Text style={dynamicStyles.activityTitle}>{aiSuggestion.title}</Text>
            <Text style={dynamicStyles.activityDuration}>{aiSuggestion.duration}</Text>
          </View>
          <Text style={dynamicStyles.activityDescription}>{aiSuggestion.description}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  placeholder: {
    width: 40,
  },
  reflectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
});