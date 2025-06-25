import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Entry } from '@/contexts/EntriesContext';

interface ThinkingPatternsChartProps {
  entries: Entry[];
}

export default function ThinkingPatternsChart({ entries }: ThinkingPatternsChartProps) {
  const { colors } = useTheme();
  
  // Analyze thinking patterns from entries using enhanced detection
  const analyzeThinkingPatterns = () => {
    const patterns: Record<string, { count: number; examples: string[] }> = {
      'Catastrophizing': { count: 0, examples: [] },
      'All-or-Nothing': { count: 0, examples: [] },
      'Mind Reading': { count: 0, examples: [] },
      'Fortune Telling': { count: 0, examples: [] },
      'Emotional Reasoning': { count: 0, examples: [] },
    };
    
    entries.forEach(entry => {
      const content = entry.content.toLowerCase();
      const sentences = entry.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      // Enhanced Catastrophizing detection
      const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless', 'everything', 'nothing'];
      const foundCatastrophizing = catastrophizingWords.filter(word => content.includes(word));
      if (foundCatastrophizing.length >= 2) {
        patterns['Catastrophizing'].count++;
        const problematicSentence = sentences.find(sentence => 
          foundCatastrophizing.some(word => sentence.toLowerCase().includes(word))
        );
        if (problematicSentence && patterns['Catastrophizing'].examples.length < 3) {
          patterns['Catastrophizing'].examples.push(problematicSentence.trim());
        }
      }
      
      // Enhanced All-or-Nothing detection
      const allOrNothingWords = ['completely', 'totally', 'perfect', 'failure', 'useless', 'worthless', 'all', 'none', 'entirely', 'absolutely'];
      const foundAllOrNothing = allOrNothingWords.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(entry.content);
      });
      if (foundAllOrNothing.length >= 2) {
        patterns['All-or-Nothing'].count++;
        const blackWhiteSentence = sentences.find(sentence => 
          foundAllOrNothing.some(word => new RegExp(`\\b${word}\\b`, 'i').test(sentence))
        );
        if (blackWhiteSentence && patterns['All-or-Nothing'].examples.length < 3) {
          patterns['All-or-Nothing'].examples.push(blackWhiteSentence.trim());
        }
      }
      
      // Enhanced Mind Reading detection
      const mindReadingPhrases = ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate', 'they judge', 'they must think', 'probably thinks'];
      const foundMindReading = mindReadingPhrases.filter(phrase => content.includes(phrase));
      if (foundMindReading.length > 0) {
        patterns['Mind Reading'].count++;
        const mindReadingSentence = sentences.find(sentence => 
          foundMindReading.some(phrase => sentence.toLowerCase().includes(phrase))
        );
        if (mindReadingSentence && patterns['Mind Reading'].examples.length < 3) {
          patterns['Mind Reading'].examples.push(mindReadingSentence.trim());
        }
      }
      
      // Fortune Telling detection
      const fortuneTellingPhrases = ['will never', 'going to fail', 'won\'t work', 'always happen', 'bound to', 'definitely will'];
      const foundFortuneTelling = fortuneTellingPhrases.filter(phrase => content.includes(phrase));
      if (foundFortuneTelling.length > 0) {
        patterns['Fortune Telling'].count++;
        const fortuneTellingSentence = sentences.find(sentence => 
          foundFortuneTelling.some(phrase => sentence.toLowerCase().includes(phrase))
        );
        if (fortuneTellingSentence && patterns['Fortune Telling'].examples.length < 3) {
          patterns['Fortune Telling'].examples.push(fortuneTellingSentence.trim());
        }
      }
      
      // Emotional Reasoning detection
      const emotionalReasoningPhrases = ['feel like', 'must be true', 'because I feel', 'feeling means', 'if I feel'];
      const foundEmotionalReasoning = emotionalReasoningPhrases.filter(phrase => content.includes(phrase));
      if (foundEmotionalReasoning.length > 0) {
        patterns['Emotional Reasoning'].count++;
        const emotionalReasoningSentence = sentences.find(sentence => 
          foundEmotionalReasoning.some(phrase => sentence.toLowerCase().includes(phrase))
        );
        if (emotionalReasoningSentence && patterns['Emotional Reasoning'].examples.length < 3) {
          patterns['Emotional Reasoning'].examples.push(emotionalReasoningSentence.trim());
        }
      }
    });
    
    return patterns;
  };
  
  const patterns = analyzeThinkingPatterns();
  const totalPatterns = Object.values(patterns).reduce((sum, pattern) => sum + pattern.count, 0);
  const maxCount = Math.max(...Object.values(patterns).map(p => p.count));
  
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

  // Generate insights based on patterns
  const generateInsights = () => {
    const activePatterns = Object.entries(patterns)
      .filter(([, data]) => data.count > 0)
      .sort(([, a], [, b]) => b.count - a.count);

    if (activePatterns.length === 0) {
      return 'Great news! No unhelpful thinking patterns detected in your recent entries. Your thoughts show good balance and perspective.';
    }

    const mostCommon = activePatterns[0];
    const [patternName, patternData] = mostCommon;
    
    if (patternData.count === 1) {
      return `You occasionally show ${patternName.toLowerCase()} in your entries. Awareness is the first step to developing more balanced thinking.`;
    } else if (patternData.count <= 3) {
      return `${patternName} appears sometimes in your entries. Consider using reframing techniques when you notice this pattern to develop more balanced perspectives.`;
    } else {
      return `${patternName} is your most frequent thinking pattern (${patternData.count} times). This is common and workable - try challenging these thoughts with evidence and alternative perspectives.`;
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
    exampleContainer: {
      marginTop: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
    },
    exampleTitle: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    exampleText: {
      fontSize: 12,
      color: colors.text,
      fontStyle: 'italic',
      lineHeight: 16,
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
  
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Thinking Patterns</Text>
      
      {Object.entries(patterns)
        .filter(([, data]) => data.count > 0)
        .sort(([, a], [, b]) => b.count - a.count)
        .map(([pattern, data]) => {
          const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
          
          return (
            <View key={pattern} style={dynamicStyles.patternItem}>
              <View style={dynamicStyles.patternHeader}>
                <Text style={dynamicStyles.patternName}>{pattern}</Text>
                <Text style={dynamicStyles.patternCount}>{data.count} times</Text>
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
              {data.examples.length > 0 && (
                <View style={dynamicStyles.exampleContainer}>
                  <Text style={dynamicStyles.exampleTitle}>Example from your entries:</Text>
                  <Text style={dynamicStyles.exampleText}>
                    "{data.examples[0].substring(0, 100)}{data.examples[0].length > 100 ? '...' : ''}"
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      
      <View style={dynamicStyles.summaryContainer}>
        <Text style={dynamicStyles.summaryTitle}>Insights</Text>
        <Text style={dynamicStyles.summaryText}>
          {generateInsights()}
        </Text>
      </View>
    </View>
  );
}