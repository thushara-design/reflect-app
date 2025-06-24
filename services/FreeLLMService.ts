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

export interface AnalysisResult {
  emotion: EmotionResult;
  distortions: CognitiveDistortion[];
  activities: ActivitySuggestion[];
  suggestedEmoji: string;
}

export interface VoiceCaptureResult {
  transcript: string;
}

class FreeLLMService {
  private isCapturing = false;

  async startVoiceCapture(): Promise<VoiceCaptureResult> {
    // Placeholder implementation for voice capture
    this.isCapturing = true;
    
    // Simulate voice capture delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      transcript: "This is a placeholder transcript from voice capture."
    };
  }

  stopVoiceCapture(): void {
    this.isCapturing = false;
  }

  async analyzeEntry(entryText: string, userPreferences: any[] = []): Promise<AnalysisResult> {
    // Placeholder implementation for entry analysis
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple emotion detection based on keywords
    const emotions = this.detectEmotion(entryText);
    const distortions = this.detectCognitiveDistortions(entryText);
    const activities = this.generateActivitySuggestions(emotions.emotion, userPreferences);

    return {
      emotion: emotions,
      distortions,
      activities,
      suggestedEmoji: emotions.emoji
    };
  }

  async generateReframedThought(originalThought: string, distortionType: string): Promise<string> {
    // Placeholder implementation for thought reframing
    await new Promise(resolve => setTimeout(resolve, 300));

    const reframingTemplates: Record<string, string> = {
      'catastrophizing': 'What evidence do I have that this worst-case scenario will actually happen? What are some more realistic outcomes?',
      'all-or-nothing': 'Instead of seeing this as completely good or bad, what middle ground or partial success can I acknowledge?',
      'mind-reading': 'I cannot know for certain what others are thinking. What other explanations might there be for their behavior?',
      'fortune-telling': 'I cannot predict the future with certainty. What steps can I take to influence a positive outcome?',
      'emotional-reasoning': 'Just because I feel this way doesn\'t mean it\'s true. What facts support or contradict this feeling?'
    };

    const template = reframingTemplates[distortionType] || 'How can I look at this situation from a more balanced perspective?';
    
    return `${template} Consider: ${originalThought.substring(0, 50)}... might have multiple perspectives worth exploring.`;
  }

  private detectEmotion(text: string): EmotionResult {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || lowerText.includes('grateful')) {
      return { emotion: 'happy', emoji: '😊', confidence: 0.8 };
    } else if (lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('down')) {
      return { emotion: 'sad', emoji: '😢', confidence: 0.75 };
    } else if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad')) {
      return { emotion: 'angry', emoji: '😠', confidence: 0.7 };
    } else if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous')) {
      return { emotion: 'anxious', emoji: '😰', confidence: 0.8 };
    } else if (lowerText.includes('stressed') || lowerText.includes('overwhelmed')) {
      return { emotion: 'stressed', emoji: '😫', confidence: 0.75 };
    } else {
      return { emotion: 'neutral', emoji: '😐', confidence: 0.6 };
    }
  }

  private detectCognitiveDistortions(text: string): CognitiveDistortion[] {
    const distortions: CognitiveDistortion[] = [];
    const lowerText = text.toLowerCase();

    // Catastrophizing detection
    if (lowerText.includes('always') || lowerText.includes('never') || lowerText.includes('worst') || lowerText.includes('terrible')) {
      distortions.push({
        type: 'catastrophizing',
        description: 'You might be imagining the worst-case scenario or thinking in extremes.',
        detectedText: ['always', 'never', 'worst', 'terrible'].filter(word => lowerText.includes(word)),
        evidence: [
          'Most situations have multiple possible outcomes',
          'Past challenges have been manageable',
          'You have coping skills and support systems'
        ],
        reframingPrompt: 'What evidence do I have that this worst-case scenario will actually happen? What are some more realistic outcomes?'
      });
    }

    // All-or-nothing thinking
    if (lowerText.includes('completely') || lowerText.includes('totally') || lowerText.includes('perfect') || lowerText.includes('failure')) {
      distortions.push({
        type: 'all-or-nothing',
        description: 'You might be seeing things in black and white, missing the gray areas.',
        detectedText: ['completely', 'totally', 'perfect', 'failure'].filter(word => lowerText.includes(word)),
        evidence: [
          'Most situations exist on a spectrum',
          'Partial success is still success',
          'Learning and growth happen in small steps'
        ],
        reframingPrompt: 'Instead of seeing this as completely good or bad, what middle ground or partial success can I acknowledge?'
      });
    }

    return distortions;
  }

  private generateActivitySuggestions(emotion: string, userPreferences: any[]): ActivitySuggestion[] {
    const baseActivities: Record<string, ActivitySuggestion[]> = {
      anxious: [
        {
          id: 'breathing-1',
          title: 'Deep Breathing Exercise',
          description: 'Practice 4-7-8 breathing to calm your nervous system',
          duration: '5 minutes',
          category: 'breathing'
        },
        {
          id: 'meditation-1',
          title: 'Guided Meditation',
          description: 'Listen to a calming meditation to center yourself',
          duration: '10 minutes',
          category: 'meditation'
        }
      ],
      sad: [
        {
          id: 'gratitude-1',
          title: 'Gratitude Practice',
          description: 'Write down three things you\'re grateful for today',
          duration: '5 minutes',
          category: 'gratitude'
        },
        {
          id: 'social-1',
          title: 'Connect with Someone',
          description: 'Reach out to a friend or family member',
          duration: '15 minutes',
          category: 'social_connection'
        }
      ],
      stressed: [
        {
          id: 'movement-1',
          title: 'Gentle Movement',
          description: 'Take a short walk or do some light stretching',
          duration: '10 minutes',
          category: 'physical_activity'
        },
        {
          id: 'music-1',
          title: 'Listen to Music',
          description: 'Play some calming or uplifting music',
          duration: '15 minutes',
          category: 'music'
        }
      ],
      angry: [
        {
          id: 'physical-1',
          title: 'Physical Release',
          description: 'Do some jumping jacks or punch a pillow',
          duration: '5 minutes',
          category: 'physical_release'
        },
        {
          id: 'journaling-1',
          title: 'Write It Out',
          description: 'Express your feelings through writing',
          duration: '10 minutes',
          category: 'journaling'
        }
      ],
      happy: [
        {
          id: 'celebration-1',
          title: 'Celebrate This Moment',
          description: 'Take time to acknowledge and savor this positive feeling',
          duration: '5 minutes',
          category: 'celebration'
        },
        {
          id: 'sharing-1',
          title: 'Share Your Joy',
          description: 'Tell someone about what made you happy',
          duration: '10 minutes',
          category: 'sharing'
        }
      ]
    };

    return baseActivities[emotion] || baseActivities['anxious'];
  }
}

export const freeLLMService = new FreeLLMService();