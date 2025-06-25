import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Entry } from '@/contexts/EntriesContext';

interface ThinkingPatternsChartProps {
  entries: Entry[];
}

export default function ThinkingPatternsChart({ entries }: ThinkingPatternsChartProps) {
  const { colors } = useTheme();
  
  // Analyze thinking patterns from entries
  const analyzeThinkingPatterns = () => {
    const patterns: Record<string, number> = {
      'Catastrophizing': 0,
      'All-or-Nothing': 0,
      'Mind Reading': 0,
      'Fortune Telling': 0,
      'Emotional Reasoning': 0,
    };
    
    entries.forEach(entry => {
      const content = entry.content.toLowerCase();
      
      // Simple pattern detection based on keywords
      if (content.includes('always') || content.includes('never') || content.includes('worst') || content.includes('terrible')) {
        patterns['Catastrophizing']++;
      }
      if (content.includes('completely') || content.includes('totally') || content.includes('perfect') || content.includes('failure')) {
        patterns['All-or-Nothing']++;
      }
      if (content.includes('they think') || content.includes('everyone thinks') || content.includes('they hate')) {
        patterns['Mind Reading']++;
      }
      if (content.includes('will never') || content.includes('going to fail') || content.includes('won\'t work')) {
        patterns['Fortune Telling']++;
      }
      if (content.includes('feel like') || content.includes('must be true') || content.includes('because I feel')) {
        patterns['Emotional Reasoning']++;
      }
    });
    
    return patterns;
  };
  
  const patterns = analyzeThinkingPatterns();
  const totalPatterns = Object.values(patterns).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(patterns));
  
  // Pattern colors
  const patternColors: Record<string, string> = {
    'Catastrophizing': '#FF6B6B',
    'All-or-Nothing': '#4ECDC4',
    'Mind Reading': '#45B7D1',
    'Fortune Telling': '#96CEB4',
    'Emotional Reasoning': '#FFEAA7',
  };
  
  // Pattern descriptions
  const patternDescriptions: Record<string, string> = {
    'Catastrophizing': 'Imagining the worst-case scenario',
    'All-or-Nothing': 'Seeing things in black and white',
    'Mind Reading': 'Assuming what others think',
    'Fortune Telling': 'Predicting negative outcomes',
    'Emotional Reasoning': 'Believing feelings equal facts',
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
    title: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 20,
    },
    patternItem: {
      marginBottom: 16,
    },
    patternHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    patternName: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text,
      flex: 1,
    },
    patternCount: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    patternDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.background,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    summaryContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
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
    emptySubtext: {
      fontSize: 13,
      color: colors.border,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 18,
    },
  });
  
  if (totalPatterns === 0) {
    return (
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.title}>Thinking Patterns</Text>
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyText}>Great news!</Text>
          <Text style={dynamicStyles.emptySubtext}>
            No unhelpful thinking patterns detected in your recent entries. Keep up the balanced perspective!
          </Text>
        </View>
      </View>
    );
  }
  
  // Get most common pattern
  const mostCommonPattern = Object.entries(patterns)
    .sort(([,a], [,b]) => b - a)
    .filter(([,count]) => count > 0)[0];
  
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Thinking Patterns</Text>
      
      {Object.entries(patterns)
        .filter(([,count]) => count > 0)
        .sort(([,a], [,b]) => b - a)
        .map(([pattern, count]) => {
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <View key={pattern} style={dynamicStyles.patternItem}>
              <View style={dynamicStyles.patternHeader}>
                <Text style={dynamicStyles.patternName}>{pattern}</Text>
                <Text style={dynamicStyles.patternCount}>{count} times</Text>
              </View>
              <Text style={dynamicStyles.patternDescription}>
                {patternDescriptions[pattern]}
              </Text>
              <View style={dynamicStyles.progressBar}>
                <View
                  style={[
                    dynamicStyles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: patternColors[pattern] || colors.primary,
                    }
                  ]}
                />
              </View>
            </View>
          );
        })}
      
      <View style={dynamicStyles.summaryContainer}>
        <Text style={dynamicStyles.summaryTitle}>Insights</Text>
        <Text style={dynamicStyles.summaryText}>
          {mostCommonPattern 
            ? `Your most common thinking pattern is ${mostCommonPattern[0]}. Awareness is the first step to developing more balanced thinking. Consider using the reframing tools when you notice these patterns.`
            : 'Your thinking patterns show good balance. Continue practicing mindful awareness of your thoughts.'
          }
        </Text>
      </View>
    </View>
  );
}