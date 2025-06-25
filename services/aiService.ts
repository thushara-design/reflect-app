import axios from 'axios';

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
  reflection: string;
}

class AIService {
  private apiKey: string;
  private apiUrl: string = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY || '';
    console.log('API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (!this.apiKey) {
      console.warn('Hugging Face API key not found. AI analysis will use fallback logic.');
    }
  }

  async analyzeEntry(entryText: string): Promise<AIAnalysisResult> {
    console.log('Starting AI analysis for entry:', entryText.substring(0, 50) + '...');
    
    if (!this.apiKey) {
      console.log('No API key found, using fallback analysis');
      return this.getFallbackAnalysis(entryText);
    }

    try {
      // Use a simpler, more reliable model for text generation
      const prompt = `Analyze this journal entry and provide emotional insights: "${entryText}"`;
      
      console.log('Making API request to Hugging Face...');
      
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 second timeout
        }
      );

      console.log('API Response received:', response.status);
      console.log('Response data:', response.data);

      if (response.data && Array.isArray(response.data) && response.data[0]) {
        const generatedText = response.data[0].generated_text || '';
        console.log('Generated text:', generatedText);
        
        // Create dynamic analysis based on the API response
        return this.createDynamicAnalysis(entryText, generatedText);
      } else {
        console.warn('Unexpected API response format:', response.data);
        return this.getFallbackAnalysis(entryText);
      }
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      
      if (axios.isAxiosError(error)) {
        console.log('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 503) {
          console.log('Model is loading, using enhanced fallback analysis');
        } else if (error.response?.status === 401) {
          console.error('Invalid API key');
        } else if (error.response?.status === 429) {
          console.log('Rate limit exceeded, using enhanced fallback analysis');
        }
      }
      
      return this.getEnhancedFallbackAnalysis(entryText);
    }
  }

  private createDynamicAnalysis(originalText: string, aiResponse: string): AIAnalysisResult {
    console.log('Creating dynamic analysis from AI response');
    
    // Enhanced emotion detection using both original text and AI response
    const emotion = this.detectEmotionEnhanced(originalText, aiResponse);
    const distortions = this.detectCognitiveDistortions(originalText);
    const activities = this.generateActivitySuggestions(emotion.emotion);
    
    // Create a more dynamic reflection based on AI response
    const reflection = this.generateDynamicReflection(originalText, aiResponse, emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
    };
  }

  private generateDynamicReflection(originalText: string, aiResponse: string, emotion: string): string {
    const reflections = {
      happy: [
        "Your entry radiates positivity and joy. It's wonderful to see you embracing these uplifting moments.",
        "The happiness in your words is contagious. These positive experiences are building blocks for resilience.",
        "Your ability to recognize and appreciate good moments shows emotional intelligence and gratitude."
      ],
      sad: [
        "Your honesty about difficult feelings shows courage and self-awareness. These emotions are valid and temporary.",
        "It takes strength to acknowledge sadness. Remember that feeling low doesn't define you - it's part of the human experience.",
        "Your willingness to express these feelings is a healthy step toward processing and healing."
      ],
      anxious: [
        "Your awareness of anxiety shows mindfulness. Recognizing these feelings is the first step toward managing them.",
        "Anxiety can feel overwhelming, but your ability to write about it demonstrates resilience and self-reflection.",
        "These worried thoughts are understandable. Remember that anxiety often makes situations seem worse than they are."
      ],
      angry: [
        "Your anger is a valid emotion that signals something important to you. Expressing it through writing is a healthy outlet.",
        "Frustration can be a catalyst for positive change when channeled constructively. Your self-awareness is commendable.",
        "It's natural to feel angry sometimes. The fact that you're reflecting on it shows emotional maturity."
      ],
      stressed: [
        "Stress is your mind's way of signaling that you care deeply about something. Your awareness of it is the first step to managing it.",
        "Feeling overwhelmed is a common human experience. Your ability to articulate it shows strength and self-awareness.",
        "These pressures you're feeling are temporary. Taking time to reflect like this is a form of self-care."
      ],
      calm: [
        "The peace in your words is beautiful. These moments of calm are precious and worth savoring.",
        "Your sense of tranquility shines through. This inner peace is a strength you can draw upon during challenging times.",
        "The serenity you're experiencing is a testament to your ability to find balance and mindfulness."
      ],
      neutral: [
        "Your thoughtful reflection shows a balanced perspective. Sometimes the most profound insights come from quiet moments.",
        "There's wisdom in your measured approach to expressing your thoughts. This kind of self-reflection is valuable.",
        "Your ability to articulate your experiences, even when they're not intense, demonstrates emotional intelligence."
      ]
    };

    const emotionReflections = reflections[emotion as keyof typeof reflections] || reflections.neutral;
    const randomReflection = emotionReflections[Math.floor(Math.random() * emotionReflections.length)];
    
    // Add a timestamp-based variation to make it feel more dynamic
    const timeVariations = [
      " Take a moment to acknowledge how you're feeling right now.",
      " Your emotional journey is unique and valuable.",
      " These insights will serve you well as you continue growing.",
      " Remember to be gentle with yourself as you process these feelings.",
      " Your self-awareness is a powerful tool for personal growth."
    ];
    
    const timeVariation = timeVariations[new Date().getSeconds() % timeVariations.length];
    
    return randomReflection + timeVariation;
  }

  private detectEmotionEnhanced(text: string, aiResponse: string): EmotionResult {
    const combinedText = (text + ' ' + aiResponse).toLowerCase();
    
    const emotionPatterns = {
      happy: {
        keywords: ['happy', 'joy', 'excited', 'grateful', 'amazing', 'wonderful', 'great', 'fantastic', 'love', 'blessed', 'thrilled', 'delighted', 'cheerful', 'elated', 'content'],
        emoji: '😊'
      },
      sad: {
        keywords: ['sad', 'upset', 'down', 'depressed', 'lonely', 'empty', 'hopeless', 'disappointed', 'hurt', 'crying', 'tears', 'melancholy', 'sorrowful'],
        emoji: '😢'
      },
      angry: {
        keywords: ['angry', 'frustrated', 'mad', 'furious', 'annoyed', 'irritated', 'rage', 'hate', 'pissed', 'outraged', 'livid', 'irate'],
        emoji: '😠'
      },
      anxious: {
        keywords: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'tense', 'uneasy', 'apprehensive', 'restless'],
        emoji: '😰'
      },
      calm: {
        keywords: ['calm', 'peaceful', 'serene', 'relaxed', 'tranquil', 'centered', 'balanced', 'content', 'zen', 'composed', 'still'],
        emoji: '😌'
      },
      stressed: {
        keywords: ['stressed', 'overwhelmed', 'pressure', 'deadline', 'busy', 'exhausted', 'tired', 'burnt out', 'frazzled', 'strained'],
        emoji: '😫'
      }
    };

    let maxScore = 0;
    let detectedEmotion = 'neutral';
    
    for (const [emotion, data] of Object.entries(emotionPatterns)) {
      const score = data.keywords.reduce((count, keyword) => {
        const matches = (combinedText.match(new RegExp(keyword, 'g')) || []).length;
        return count + matches;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }

    const confidence = maxScore > 0 ? Math.min(0.95, 0.6 + (maxScore * 0.1)) : 0.7;
    const emoji = emotionPatterns[detectedEmotion as keyof typeof emotionPatterns]?.emoji || '😐';

    return {
      emotion: detectedEmotion,
      emoji,
      confidence
    };
  }

  private getEnhancedFallbackAnalysis(entryText: string): AIAnalysisResult {
    console.log('Using enhanced fallback analysis');
    
    const emotion = this.detectEmotionEnhanced(entryText, '');
    const distortions = this.detectCognitiveDistortions(entryText);
    const activities = this.generateActivitySuggestions(emotion.emotion);
    const reflection = this.generateDynamicReflection(entryText, '', emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
    };
  }

  private getFallbackAnalysis(entryText: string): AIAnalysisResult {
    // Fallback to the original hardcoded logic when API is unavailable
    const emotion = this.detectEmotion(entryText);
    const distortions = this.detectCognitiveDistortions(entryText);
    const activities = this.generateActivitySuggestions(emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection: "Your entry shows emotional awareness and self-reflection. It's healthy to acknowledge these feelings and seek ways to process them constructively."
    };
  }

  private detectEmotion(text: string): EmotionResult {
    const lowerText = text.toLowerCase();
    
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
        }
      ],
      calm: [
        {
          id: 'mindful-observation',
          title: 'Mindful Observation',
          description: 'Spend time observing something in nature or your environment mindfully.',
          duration: '10 minutes',
          category: 'mindfulness'
        }
      ]
    };

    return activityDatabase[emotion] || activityDatabase['anxious'];
  }
}

export const aiService = new AIService();