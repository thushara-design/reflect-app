export interface EmotionalAnalysis {
  emotion: string;
  emoji: string;
  confidence: number;
}

export interface CognitiveDistortion {
  type: string;
  description: string;
  evidence: string[];
  reframingPrompt: string;
}

export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
}

export interface AIAnalysisResult {
  emotion: EmotionalAnalysis;
  distortions: CognitiveDistortion[];
  activities: ActivitySuggestion[];
}

class AIService {
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';
  
  // Mock API key - in production, this should be stored securely
  private readonly API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'mock-key';

  async analyzeEntry(content: string, userPreferences?: any): Promise<AIAnalysisResult> {
    // For demo purposes, we'll use mock analysis
    // In production, this would make an actual API call
    return this.mockAnalyzeEntry(content);
  }

  private mockAnalyzeEntry(content: string): AIAnalysisResult {
    const lowerContent = content.toLowerCase();
    
    // Emotion detection
    let emotion = 'neutral';
    let emoji = '😐';
    
    if (lowerContent.includes('happy') || lowerContent.includes('joy') || lowerContent.includes('excited')) {
      emotion = 'happy';
      emoji = '😊';
    } else if (lowerContent.includes('sad') || lowerContent.includes('down') || lowerContent.includes('upset')) {
      emotion = 'sad';
      emoji = '😢';
    } else if (lowerContent.includes('anxious') || lowerContent.includes('nervous') || lowerContent.includes('worried')) {
      emotion = 'anxious';
      emoji = '😰';
    } else if (lowerContent.includes('angry') || lowerContent.includes('frustrated') || lowerContent.includes('mad')) {
      emotion = 'angry';
      emoji = '😠';
    } else if (lowerContent.includes('stressed') || lowerContent.includes('overwhelmed')) {
      emotion = 'stressed';
      emoji = '😵';
    }

    // Cognitive distortion detection
    const distortions: CognitiveDistortion[] = [];
    
    if (lowerContent.includes('always') || lowerContent.includes('never') || lowerContent.includes('everyone')) {
      distortions.push({
        type: 'All-or-Nothing Thinking',
        description: 'You might be seeing things in black and white terms.',
        evidence: [
          'You cared enough to speak up',
          'Everyone stumbles sometimes',
          'One moment doesn\'t define your whole ability'
        ],
        reframingPrompt: 'Try rewriting this thought with more balanced language:'
      });
    }

    if (lowerContent.includes('should') || lowerContent.includes('must') || lowerContent.includes('have to')) {
      distortions.push({
        type: 'Should Statements',
        description: 'You might be putting unrealistic pressure on yourself.',
        evidence: [
          'It\'s okay to have off days',
          'Learning takes time and practice',
          'Self-compassion leads to better outcomes'
        ],
        reframingPrompt: 'How would you speak to a good friend in this situation?'
      });
    }

    // Activity suggestions based on emotion
    const activities: ActivitySuggestion[] = this.getActivitiesForEmotion(emotion);

    return {
      emotion: {
        emotion,
        emoji,
        confidence: 0.8
      },
      distortions,
      activities
    };
  }

  private getActivitiesForEmotion(emotion: string): ActivitySuggestion[] {
    const activityMap: Record<string, ActivitySuggestion[]> = {
      anxious: [
        {
          id: '1',
          title: 'Deep Breathing Exercise',
          description: '4-7-8 breathing technique to calm your nervous system',
          category: 'mindfulness',
          duration: '5 minutes'
        },
        {
          id: '2',
          title: 'Progressive Muscle Relaxation',
          description: 'Tense and release muscle groups to reduce physical tension',
          category: 'relaxation',
          duration: '10 minutes'
        }
      ],
      sad: [
        {
          id: '3',
          title: 'Gratitude Practice',
          description: 'Write down 3 things you\'re grateful for today',
          category: 'mindfulness',
          duration: '5 minutes'
        },
        {
          id: '4',
          title: 'Call a Friend',
          description: 'Reach out to someone who cares about you',
          category: 'social',
          duration: '15 minutes'
        }
      ],
      stressed: [
        {
          id: '5',
          title: 'Take a Walk',
          description: 'Get some fresh air and gentle movement',
          category: 'physical',
          duration: '15 minutes'
        },
        {
          id: '6',
          title: 'Listen to Calming Music',
          description: 'Put on your favorite relaxing playlist',
          category: 'creative',
          duration: '10 minutes'
        }
      ],
      neutral: [
        {
          id: '7',
          title: 'Mindful Meditation',
          description: 'A short guided meditation to center yourself',
          category: 'mindfulness',
          duration: '10 minutes'
        },
        {
          id: '8',
          title: 'Journal Reflection',
          description: 'Explore your thoughts and feelings deeper',
          category: 'reflection',
          duration: '15 minutes'
        }
      ]
    };

    return activityMap[emotion] || activityMap.neutral;
  }

  async generateReframedThought(originalThought: string, distortionType: string): Promise<string> {
    // Mock reframing - in production, this would use AI
    const reframingTemplates: Record<string, string[]> = {
      'All-or-Nothing Thinking': [
        'Sometimes I struggle with speaking up, and that\'s okay. I\'m learning and improving.',
        'This was one moment, and it doesn\'t define my overall communication abilities.',
        'I had the courage to try, which is already a step forward.'
      ],
      'Should Statements': [
        'I would like to improve my communication skills, and I can practice in low-pressure situations.',
        'It\'s natural to feel nervous in meetings, and I can be patient with myself as I grow.',
        'I prefer to speak confidently, and I can work toward that goal gradually.'
      ]
    };

    const templates = reframingTemplates[distortionType] || reframingTemplates['All-or-Nothing Thinking'];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

export const aiService = new AIService();