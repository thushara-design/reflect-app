import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Entry } from '@/contexts/EntriesContext';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react-native';

interface HealingStrengthChartProps {
  entries: Entry[];
}

interface PatternTrend {
  pattern: string;
  weeklyData: number[];
  trend: 'improving' | 'stable' | 'concerning';
  healingScore: number;
  description: string;
}

export default function HealingStrengthChart({ entries }: HealingStrengthChartProps) {
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState<'4weeks' | '8weeks'>('4weeks');
  
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48;
  
  // Analyze healing strength by tracking pattern reduction over time
  const analyzeHealingStrength = (): { patterns: PatternTrend[]; overallScore: number } => {
    const weeksToAnalyze = timeframe === '4weeks' ? 4 : 8;
    const now = new Date();
    
    // Initialize weekly buckets
    const weeklyBuckets: Entry[][] = [];
    for (let i = weeksToAnalyze - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      weeklyBuckets.push(weekEntries);
    }
    
    // Pattern detection functions
    const detectPatterns = (entries: Entry[]) => {
      const patterns = {
        catastrophizing: 0,
        allOrNothing: 0,
        mindReading: 0,
        fortuneTelling: 0,
        emotionalReasoning: 0
      };
      
      entries.forEach(entry => {
        const content = entry.content.toLowerCase();
        
        // Catastrophizing
        const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless'];
        const foundCatastrophizing = catastrophizingWords.filter(word => content.includes(word));
        if (foundCatastrophizing.length >= 2) patterns.catastrophizing++;
        
        // All-or-Nothing
        const allOrNothingWords = ['completely', 'totally', 'perfect', 'failure', 'useless', 'worthless', 'all', 'none'];
        const foundAllOrNothing = allOrNothingWords.filter(word => content.includes(word));
        if (foundAllOrNothing.length >= 2) patterns.allOrNothing++;
        
        // Mind Reading
        const mindReadingPhrases = ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate', 'they judge'];
        const foundMindReading = mindReadingPhrases.some(phrase => content.includes(phrase));
        if (foundMindReading) patterns.mindReading++;
        
        // Fortune Telling
        const fortuneTellingPhrases = ['will never', 'going to fail', 'won\'t work', 'always happen', 'bound to'];
        const foundFortuneTelling = fortuneTellingPhrases.some(phrase => content.includes(phrase));
        if (foundFortuneTelling) patterns.fortuneTelling++;
        
        // Emotional Reasoning
        const emotionalReasoningPhrases = ['feel like', 'must be true', 'because I feel', 'feeling means'];
        const foundEmotionalReasoning = emotionalReasoningPhrases.some(phrase => content.includes(phrase));
        if (foundEmotionalReasoning) patterns.emotionalReasoning++;
      });
      
      return patterns;
    };
    
    // Analyze each pattern across weeks
    const patternTrends: PatternTrend[] = [];
    const patternNames = {
      catastrophizing: 'Catastrophizing',
      allOrNothing: 'All-or-Nothing',
      mindReading: 'Mind Reading',
      fortuneTelling: 'Fortune Telling',
      emotionalReasoning: 'Emotional Reasoning'
    };
    
    const patternDescriptions = {
      catastrophizing: 'Imagining worst-case scenarios',
      allOrNothing: 'Black and white thinking',
      mindReading: 'Assuming others\' thoughts',
      fortuneTelling: 'Predicting negative outcomes',
      emotionalReasoning: 'Feelings as facts'
    };
    
    Object.keys(patternNames).forEach(patternKey => {
      const weeklyData = weeklyBuckets.map(weekEntries => {
        const weekPatterns = detectPatterns(weekEntries);
        const totalEntries = weekEntries.length;
        return totalEntries > 0 ? (weekPatterns[patternKey as keyof typeof weekPatterns] / totalEntries) * 100 : 0;
      });
      
      // Calculate trend
      const firstHalf = weeklyData.slice(0, Math.floor(weeklyData.length / 2));
      const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length || 0;
      const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length || 0;
      
      let trend: 'improving' | 'stable' | 'concerning';
      const improvement = firstHalfAvg - secondHalfAvg;
      
      if (improvement > 10) trend = 'improving';
      else if (improvement < -10) trend = 'concerning';
      else trend = 'stable';
      
      // Calculate healing score (0-100, higher is better)
      const maxValue = Math.max(...weeklyData);
      const recentValue = weeklyData[weeklyData.length - 1] || 0;
      const healingScore = Math.max(0, 100 - recentValue - (maxValue * 0.3));
      
      if (weeklyData.some(val => val > 0)) {
        patternTrends.push({
          pattern: patternNames[patternKey as keyof typeof patternNames],
          weeklyData,
          trend,
          healingScore: Math.round(healingScore),
          description: patternDescriptions[patternKey as keyof typeof patternDescriptions]
        });
      }
    });
    
    // Calculate overall healing score
    const overallScore = patternTrends.length > 0 
      ? Math.round(patternTrends.reduce((sum, p) => sum + p.healingScore, 0) / patternTrends.length)
      : 85; // Default good score if no patterns detected
    
    return { patterns: patternTrends, overallScore };
  };
  
  const { patterns, overallScore } = analyzeHealingStrength();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green - Excellent
    if (score >= 60) return '#FF9800'; // Orange - Good
    if (score >= 40) return '#FF5722'; // Red-Orange - Needs attention
    return '#F44336'; // Red - Concerning
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good Progress';
    if (score >= 40) return 'Improving';
    return 'Needs Focus';
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp size={16} color="#4CAF50" strokeWidth={1.5} />;
      case 'concerning': return <TrendingDown size={16} color="#F44336" strokeWidth={1.5} />;
      default: return <Minus size={16} color="#FF9800" strokeWidth={1.5} />;
    }
  };
  
  const generateHealingInsight = () => {
    if (patterns.length === 0) {
      return "Excellent mental resilience! No concerning thought patterns detected. Your thinking shows healthy balance and perspective.";
    }
    
    const improvingPatterns = patterns.filter(p => p.trend === 'improving').length;
    const concerningPatterns = patterns.filter(p => p.trend === 'concerning').length;
    
    if (improvingPatterns > concerningPatterns) {
      return `Great progress! ${improvingPatterns} pattern${improvingPatterns > 1 ? 's are' : ' is'} improving. Your healing journey shows positive momentum.`;
    } else if (concerningPatterns > 0) {
      return `${concerningPatterns} pattern${concerningPatterns > 1 ? 's need' : ' needs'} attention. Focus on reframing techniques and self-compassion practices.`;
    } else {
      return "Your thought patterns are stable. Continue with your current coping strategies and mindfulness practices.";
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
    scoreContainer: {
      alignItems: 'center',
      marginBottom: 24,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
    },
    scoreCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 8,
    },
    scoreText: {
      fontSize: 32,
      fontWeight: '300',
      color: colors.text,
    },
    scoreLabel: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 4,
    },
    scoreSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    patternsContainer: {
      marginBottom: 20,
    },
    patternItem: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
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
    patternTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    patternScore: {
      fontSize: 16,
      fontWeight: '400',
      marginLeft: 8,
    },
    patternDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    chartContainer: {
      height: 40,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 8,
    },
    chartBar: {
      flex: 1,
      borderRadius: 2,
      minHeight: 4,
    },
    insightContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
    },
    insightTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    insightText: {
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
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 13,
      color: colors.border,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 18,
    },
  });
  
  if (entries.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Healing Strength</Text>
        </View>
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyText}>Building Your Foundation</Text>
          <Text style={dynamicStyles.emptySubtext}>
            Start journaling to track your healing progress and mental resilience over time.
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Healing Strength</Text>
        <View style={dynamicStyles.timeframeButtons}>
          <TouchableOpacity
            style={[
              dynamicStyles.timeframeButton,
              timeframe === '4weeks' && dynamicStyles.activeTimeframeButton
            ]}
            onPress={() => setTimeframe('4weeks')}
          >
            <Text style={[
              dynamicStyles.timeframeButtonText,
              timeframe === '4weeks' && dynamicStyles.activeTimeframeButtonText
            ]}>
              4 Weeks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.timeframeButton,
              timeframe === '8weeks' && dynamicStyles.activeTimeframeButton
            ]}
            onPress={() => setTimeframe('8weeks')}
          >
            <Text style={[
              dynamicStyles.timeframeButtonText,
              timeframe === '8weeks' && dynamicStyles.activeTimeframeButtonText
            ]}>
              8 Weeks
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Overall Healing Score */}
      <View style={dynamicStyles.scoreContainer}>
        <View style={[
          dynamicStyles.scoreCircle,
          { borderColor: getScoreColor(overallScore) }
        ]}>
          <Text style={[dynamicStyles.scoreText, { color: getScoreColor(overallScore) }]}>
            {overallScore}
          </Text>
        </View>
        <Text style={[dynamicStyles.scoreLabel, { color: getScoreColor(overallScore) }]}>
          {getScoreLabel(overallScore)}
        </Text>
        <Text style={dynamicStyles.scoreSubtext}>
          Healing Strength Score
        </Text>
      </View>
      
      {/* Pattern Breakdown */}
      {patterns.length > 0 && (
        <View style={dynamicStyles.patternsContainer}>
          {patterns.map((pattern) => {
            const maxValue = Math.max(...pattern.weeklyData);
            
            return (
              <View key={pattern.pattern} style={dynamicStyles.patternItem}>
                <View style={dynamicStyles.patternHeader}>
                  <Text style={dynamicStyles.patternName}>{pattern.pattern}</Text>
                  <View style={dynamicStyles.patternTrend}>
                    {getTrendIcon(pattern.trend)}
                    <Text style={[
                      dynamicStyles.patternScore,
                      { color: getScoreColor(pattern.healingScore) }
                    ]}>
                      {pattern.healingScore}
                    </Text>
                  </View>
                </View>
                <Text style={dynamicStyles.patternDescription}>
                  {pattern.description}
                </Text>
                <View style={dynamicStyles.chartContainer}>
                  {pattern.weeklyData.map((value, index) => {
                    const height = maxValue > 0 ? (value / maxValue) * 24 + 4 : 4;
                    const intensity = value / 100;
                    const barColor = `rgba(255, 107, 107, ${Math.max(0.2, intensity)})`;
                    
                    return (
                      <View
                        key={index}
                        style={[
                          dynamicStyles.chartBar,
                          {
                            height,
                            backgroundColor: barColor,
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
      
      {/* Healing Insights */}
      <View style={dynamicStyles.insightContainer}>
        <View style={dynamicStyles.insightTitle}>
          <Zap size={16} color={colors.primary} strokeWidth={1.5} />
          <Text style={[dynamicStyles.insightTitle, { marginBottom: 0 }]}>Healing Insights</Text>
        </View>
        <Text style={dynamicStyles.insightText}>
          {generateHealingInsight()}
        </Text>
      </View>
    </View>
  );
}