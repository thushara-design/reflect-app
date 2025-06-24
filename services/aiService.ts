export interface EmotionResult {
  emotion: string;
  emoji: string;
  confidence: number;
}

export interface CognitiveDistortion {
  type: string;
  description: string;
  detectedText: string[];
  evidence: string[];
  reframingPrompt: string;
}

export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
}

export interface AIAnalysisResult {
  emotion: EmotionResult;
  distortions: CognitiveDistortion[];
  activities: ActivitySuggestion[];
  suggestedEmoji: string;
}

class AIService {
  async analyzeEntry(entryText: string): Promise<AIAnalysisResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Analyze the entry text
    const emotion = this.detectEmotion(entryText);
    const distortions = this.detectCognitiveDistortions(entryText);
    const activities = this.generateActivitySuggestions(emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji
    };
  }

  private detectEmotion(text: string): EmotionResult {
    const lowerText = text.toLowerCase();
    
    // Enhanced emotion detection with more keywords
    const emotionPatterns = {
      happy: ['happy', 'joy', 'excited', 'grateful', 'amazing', 'wonderful', 'great', 'fantastic', 'love', 'blessed', 'thrilled', 'delighted'],
      sad: ['sad', 'upset', 'down', 'depressed', 'lonely', 'empty', 'hopeless', 'disappointed', 'hurt', 'crying', 'tears'],
      angry: ['angry', 'frustrated', 'mad', 'furious', 'annoyed', 'irritated', 'rage', 'hate', 'pissed', 'outraged'],
      anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'tense', 'uneasy'],
      calm: ['calm', 'peaceful', 'serene', 'relaxed', 'tranquil', 'centered', 'balanced', 'content', 'zen'],
      stressed: ['stressed', 'overwhelmed', 'pressure', 'deadline', 'busy', 'exhausted', 'tired', 'burnt out']
    };

    let maxScore = 0;
    let detectedEmotion = 'neutral';
    
    for (const [emotion, keywords] of Object.entries(emotionPatterns)) {
      const score = keywords.reduce((count, keyword) => {
        return count + (lowerText.split(keyword).length - 1);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }

    const emotionEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      calm: '😌',
      stressed: '😫',
      neutral: '😐'
    };

    const confidence = maxScore > 0 ? Math.min(0.9, 0.5 + (maxScore * 0.1)) : 0.6;

    return {
      emotion: detectedEmotion,
      emoji: emotionEmojis[detectedEmotion],
      confidence
    };
  }

  private detectCognitiveDistortions(text: string): CognitiveDistortion[] {
    const distortions: CognitiveDistortion[] = [];
    const lowerText = text.toLowerCase();

    // Catastrophizing detection
    const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless'];
    const foundCatastrophizing = catastrophizingWords.filter(word => lowerText.includes(word));
    
    if (foundCatastrophizing.length > 0) {
      distortions.push({
        type: 'Catastrophizing',
        description: 'You might be imagining the worst-case scenario or thinking that something is far worse than it actually is.',
        detectedText: foundCatastrophizing,
        evidence: [
          'Most situations have multiple possible outcomes, not just the worst one',
          'You have successfully handled difficult situations before',
          'Even if something challenging happens, you have coping skills and support'
        ],
        reframingPrompt: 'What evidence do I have that this worst-case scenario will actually happen? What are some more realistic outcomes?'
      });
    }

    // All-or-nothing thinking
    const allOrNothingWords = ['completely', 'totally', 'perfect', 'failure', 'useless', 'worthless', 'everything', 'nothing'];
    const foundAllOrNothing = allOrNothingWords.filter(word => lowerText.includes(word));
    
    if (foundAllOrNothing.length > 0) {
      distortions.push({
        type: 'All-or-Nothing Thinking',
        description: 'You might be seeing things in black and white, missing the gray areas and partial successes.',
        detectedText: foundAllOrNothing,
        evidence: [
          'Most situations exist on a spectrum rather than being all good or all bad',
          'Partial success is still success and worth acknowledging',
          'Learning and growth happen gradually, not in perfect jumps'
        ],
        reframingPrompt: 'Instead of seeing this as completely good or bad, what middle ground or partial success can I acknowledge?'
      });
    }

    // Mind reading
    const mindReadingPhrases = ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate me', 'they judge'];
    const foundMindReading = mindReadingPhrases.some(phrase => lowerText.includes(phrase));
    
    if (foundMindReading) {
      distortions.push({
        type: 'Mind Reading',
        description: 'You might be assuming you know what others are thinking without having evidence.',
        detectedText: mindReadingPhrases.filter(phrase => lowerText.includes(phrase)),
        evidence: [
          'You cannot know for certain what others are thinking',
          'People often have their own concerns and may not be focused on judging you',
          'There could be many explanations for someone\'s behavior'
        ],
        reframingPrompt: 'What evidence do I actually have about what this person is thinking? What other explanations could there be?'
      });
    }

    // Emotional reasoning
    const emotionalReasoningPhrases = ['i feel like', 'i feel that', 'it feels like'];
    const foundEmotionalReasoning = emotionalReasoningPhrases.some(phrase => lowerText.includes(phrase));
    
    if (foundEmotionalReasoning && (lowerText.includes('failure') || lowerText.includes('stupid') || lowerText.includes('worthless'))) {
      distortions.push({
        type: 'Emotional Reasoning',
        description: 'You might be assuming that because you feel a certain way, it must be true.',
        detectedText: emotionalReasoningPhrases.filter(phrase => lowerText.includes(phrase)),
        evidence: [
          'Feelings are valid but they don\'t always reflect facts',
          'Emotions can be influenced by many factors like stress, fatigue, or past experiences',
          'You can feel something strongly and still question whether it\'s accurate'
        ],
        reframingPrompt: 'Just because I feel this way doesn\'t mean it\'s true. What facts support or contradict this feeling?'
      });
    }

    return distortions;
  }

  private generateActivitySuggestions(emotion: string): ActivitySuggestion[] {
    const activityDatabase: Record<string, ActivitySuggestion[]> = {
      anxious: [
        {
          id: 'breathing-box',
          title: 'Box Breathing',
          description: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 times.',
          duration: '3 minutes',
          category: 'breathing'
        },
        {
          id: 'grounding-5-4-3-2-1',
          title: '5-4-3-2-1 Grounding',
          description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
          duration: '5 minutes',
          category: 'grounding'
        },
        {
          id: 'progressive-relaxation',
          title: 'Progressive Muscle Relaxation',
          description: 'Tense and release each muscle group from toes to head.',
          duration: '10 minutes',
          category: 'relaxation'
        }
      ],
      sad: [
        {
          id: 'gratitude-three',
          title: 'Three Good Things',
          description: 'Write down three things that went well today, no matter how small.',
          duration: '5 minutes',
          category: 'gratitude'
        },
        {
          id: 'self-compassion',
          title: 'Self-Compassion Break',
          description: 'Speak to yourself as you would to a good friend going through this.',
          duration: '5 minutes',
          category: 'self-care'
        },
        {
          id: 'gentle-movement',
          title: 'Gentle Movement',
          description: 'Take a slow walk or do some gentle stretching.',
          duration: '15 minutes',
          category: 'movement'
        }
      ],
      angry: [
        {
          id: 'anger-release',
          title: 'Physical Release',
          description: 'Do jumping jacks, punch a pillow, or squeeze and release your fists.',
          duration: '5 minutes',
          category: 'physical'
        },
        {
          id: 'cooling-breath',
          title: 'Cooling Breath',
          description: 'Take slow, deep breaths while counting backwards from 10.',
          duration: '3 minutes',
          category: 'breathing'
        },
        {
          id: 'anger-journal',
          title: 'Anger Journaling',
          description: 'Write about what triggered your anger without censoring yourself.',
          duration: '10 minutes',
          category: 'writing'
        }
      ],
      stressed: [
        {
          id: 'priority-list',
          title: 'Priority Setting',
          description: 'List your tasks and identify the top 3 most important ones.',
          duration: '10 minutes',
          category: 'organization'
        },
        {
          id: 'stress-walk',
          title: 'Stress-Relief Walk',
          description: 'Take a brisk walk while focusing on your surroundings.',
          duration: '15 minutes',
          category: 'movement'
        },
        {
          id: 'boundary-setting',
          title: 'Boundary Check',
          description: 'Identify one thing you can say no to today to reduce stress.',
          duration: '5 minutes',
          category: 'boundaries'
        }
      ],
      happy: [
        {
          id: 'savor-moment',
          title: 'Savor This Moment',
          description: 'Take time to fully experience and appreciate this positive feeling.',
          duration: '5 minutes',
          category: 'mindfulness'
        },
        {
          id: 'share-joy',
          title: 'Share Your Joy',
          description: 'Tell someone about what made you happy or write about it.',
          duration: '10 minutes',
          category: 'connection'
        },
        {
          id: 'gratitude-expansion',
          title: 'Expand Gratitude',
          description: 'Think of all the people and circumstances that contributed to this happiness.',
          duration: '5 minutes',
          category: 'gratitude'
        }
      ],
      calm: [
        {
          id: 'mindful-observation',
          title: 'Mindful Observation',
          description: 'Spend time observing something in nature or your environment mindfully.',
          duration: '10 minutes',
          category: 'mindfulness'
        },
        {
          id: 'creative-expression',
          title: 'Creative Expression',
          description: 'Draw, write, or create something that expresses your current state.',
          duration: '15 minutes',
          category: 'creativity'
        }
      ]
    };

    // Return activities for the detected emotion, or default to anxious activities
    return activityDatabase[emotion] || activityDatabase['anxious'];
  }
}

export const aiService = new AIService();