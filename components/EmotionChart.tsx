import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Entry } from '@/contexts/EntriesContext';
import { aiService } from '@/services/aiService';

interface EmotionChartProps {
  entries: Entry[];
}

export default function EmotionChart({ entries }: EmotionChartProps) {
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48; // Account for padding
  
  // Process emotion data from actual entries
  const processEmotionData = () => {
    const now = new Date();
    const daysToShow = timeframe === 'week' ? 7 : 30;
    const emotionCounts: Record<string, number> = {};
    const dailyEmotions: Record<string, string[]> = {};
    
    // Initialize days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyEmotions[dateKey] = [];
    }
    
    // Process entries and detect emotions from content
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      const dateKey = entryDate.toISOString().split('T')[0];
      
      if (dailyEmotions[dateKey] !== undefined) {
        // Use AI service to detect emotion from entry content
        const emotionDetector = new (aiService as any).emotionDetector.constructor();
        const detectedEmotion = emotionDetector.detectEmotion(entry.content, '');
        
        const emotion = detectedEmotion.emotion || entry.mood || 'neutral';
        dailyEmotions[dateKey].push(emotion);
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });
    
    return { emotionCounts, dailyEmotions };
  };
  
  const { emotionCounts, dailyEmotions } = processEmotionData();
  
  // Emotion colors
  const emotionColors: Record<string, string> = {
    happy: '#4CAF50',
    sad: '#2196F3',
    angry: '#F44336',
    anxious: '#FF9800',
    stressed: '#9C27B0',
    calm: '#00BCD4',
    frustrated: '#FF5722',
    neutral: '#9E9E9E',
    grateful: '#8BC34A',
    excited: '#E91E63',
    lonely: '#607D8B',
    content: '#4CAF50',
    overwhelmed: '#795548',
  };
  
  // Get top emotions
  const topEmotions = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);
  
  const totalEntries = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate weekly trends
  const getWeeklyTrend = () => {
    if (timeframe !== 'week' || totalEntries === 0) return '';
    
    const thisWeekEmotions = Object.values(dailyEmotions).flat();
    const positiveEmotions = ['happy', 'grateful', 'excited', 'content', 'calm'];
    const negativeEmotions = ['sad', 'angry', 'anxious', 'stressed', 'frustrated', 'lonely', 'overwhelmed'];
    
    const positiveCount = thisWeekEmotions.filter(e => positiveEmotions.includes(e)).length;
    const negativeCount = thisWeekEmotions.filter(e => negativeEmotions.includes(e)).length;
    
    if (positiveCount > negativeCount) {
      return 'You\'ve had more positive emotions this week. Keep nurturing what brings you joy!';
    } else if (negativeCount > positiveCount) {
      return 'This week has been challenging emotionally. Remember to be kind to yourself and use your coping strategies.';
    } else {
      return 'Your emotions have been balanced this week. This shows good emotional regulation.';
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
    },
    timeframeButtons: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 2,
    },
    timeframeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    activeTimeframeButton: {
      backgroundColor: colors.primary,
    },
    timeframeButtonText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    activeTimeframeButtonText: {
      color: colors.background,
    },
    chartContainer: {
      marginBottom: 20,
    },
    emotionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    emotionLabel: {
      width: 80,
      fontSize: 14,
      color: colors.text,
      fontWeight: '300',
      textTransform: 'capitalize',
    },
    barContainer: {
      flex: 1,
      height: 20,
      backgroundColor: colors.background,
      borderRadius: 10,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      borderRadius: 10,
    },
    emotionCount: {
      width: 30,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    summaryContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
    },
    summaryTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '300',
    },
  });
  
  if (totalEntries === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Emotion Trends</Text>
        </View>
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyText}>No emotion data yet</Text>
        </View>
      </View>
    );
  }
  
  const maxCount = Math.max(...Object.values(emotionCounts));
  
  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Emotion Trends</Text>
        <View style={dynamicStyles.timeframeButtons}>
          <TouchableOpacity
            style={[
              dynamicStyles.timeframeButton,
              timeframe === 'week' && dynamicStyles.activeTimeframeButton
            ]}
            onPress={() => setTimeframe('week')}
          >
            <Text style={[
              dynamicStyles.timeframeButtonText,
              timeframe === 'week' && dynamicStyles.activeTimeframeButtonText
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.timeframeButton,
              timeframe === 'month' && dynamicStyles.activeTimeframeButton
            ]}
            onPress={() => setTimeframe('month')}
          >
            <Text style={[
              dynamicStyles.timeframeButtonText,
              timeframe === 'month' && dynamicStyles.activeTimeframeButtonText
            ]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={dynamicStyles.chartContainer}>
        {topEmotions.map(([emotion, count]) => {
          const percentage = (count / maxCount) * 100;
          const barWidth = (percentage / 100) * (chartWidth - 140); // Account for label and count widths
          
          return (
            <View key={emotion} style={dynamicStyles.emotionBar}>
              <Text style={dynamicStyles.emotionLabel}>{emotion}</Text>
              <View style={dynamicStyles.barContainer}>
                <View
                  style={[
                    dynamicStyles.bar,
                    {
                      width: barWidth,
                      backgroundColor: emotionColors[emotion] || colors.primary,
                    }
                  ]}
                />
              </View>
              <Text style={dynamicStyles.emotionCount}>{count}</Text>
            </View>
          );
        })}
      </View>
      
      <View style={dynamicStyles.summaryContainer}>
        <Text style={dynamicStyles.summaryTitle}>Insights</Text>
        <Text style={dynamicStyles.summaryText}>
          {topEmotions.length > 0 
            ? `Your most frequent emotion this ${timeframe} was ${topEmotions[0][0]}. You've logged ${totalEntries} emotional check-ins. ${getWeeklyTrend()}`
            : `Keep tracking your emotions to see patterns and insights about your emotional wellbeing.`
          }
        </Text>
      </View>
    </View>
  );
}