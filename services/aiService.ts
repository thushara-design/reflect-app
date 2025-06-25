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
  private apiUrl: string = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-8B-Instruct';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Hugging Face API key not found. AI analysis will use fallback logic.');
    }
  }

  async analyzeEntry(entryText: string): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      console.log('Using fallback AI analysis due to missing API key');
      return this.getFallbackAnalysis(entryText);
    }

    try {
      const prompt = this.constructPrompt(entryText);
      
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data && response.data[0] && response.data[0].generated_text) {
        const generatedText = response.data[0].generated_text;
        return this.parseAIResponse(generatedText, entryText);
      } else {
        console.warn('Unexpected API response format, using fallback');
        return this.getFallbackAnalysis(entryText);
      }
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 503) {
          console.log('Model is loading, using fallback analysis');
        } else if (error.response?.status === 401) {
          console.error('Invalid API key');
        } else if (error.response?.status === 429) {
          console.log('Rate limit exceeded, using fallback analysis');
        }
      }
      
      return this.getFallbackAnalysis(entryText);
    }
  }

  private constructPrompt(entryText: string): string {
    return `You are a compassionate AI therapist analyzing a journal entry. Please analyze the following journal entry and respond with a JSON object containing the following structure:

{
  "emotion": {
    "emotion": "primary emotion detected (happy, sad, anxious, angry, stressed, calm, neutral)",
    "emoji": "appropriate emoji for the emotion",
    "confidence": "confidence score between 0 and 1"
  },
  "reflection": "A supportive, therapeutic reflection on the entry (2-3 sentences)",
  "distortions": [
    {
      "type": "type of cognitive distortion if detected",
      "description": "explanation of the distortion",
      "detectedText": ["specific phrases that show this pattern"],
      "evidence": ["facts that challenge this thinking pattern"],
      "reframingPrompt": "question to help reframe the thought"
    }
  ],
  "activities": [
    {
      "id": "unique_id",
      "title": "activity name",
      "description": "brief description of the activity",
      "duration": "estimated time needed",
      "category": "type of activity"
    }
  ]
}

Journal Entry: "${entryText}"

Please respond only with the JSON object, no additional text:`;
  }

  private parseAIResponse(generatedText: string, originalText: string): AIAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate and structure the response
      const emotion: EmotionResult = {
        emotion: parsedResponse.emotion?.emotion || 'neutral',
        emoji: parsedResponse.emotion?.emoji || '😐',
        confidence: parsedResponse.emotion?.confidence || 0.75
      };

      const distortions: CognitiveDistortion[] = (parsedResponse.distortions || []).map((d: any) => ({
        type: d.type || 'Unknown Pattern',
        description: d.description || 'Potential unhelpful thinking pattern detected',
        detectedText: Array.isArray(d.detectedText) ? d.detectedText : [],
        evidence: Array.isArray(d.evidence) ? d.evidence : ['Consider alternative perspectives'],
        reframingPrompt: d.reframingPrompt || 'How might you view this situation differently?'
      }));

      const activities: ActivitySuggestion[] = (parsedResponse.activities || []).map((a: any, index: number) => ({
        id: a.id || `ai-activity-${index}`,
        title: a.title || 'Mindful Breathing',
        description: a.description || 'Take a few deep breaths to center yourself',
        duration: a.duration || '5 minutes',
        category: a.category || 'mindfulness'
      }));

      return {
        emotion,
        distortions,
        activities,
        suggestedEmoji: emotion.emoji,
        reflection: parsedResponse.reflection || 'Your entry shows self-awareness and reflection, which are important steps in emotional growth.'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackAnalysis(originalText);
    }
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