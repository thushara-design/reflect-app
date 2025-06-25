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
  private apiUrl: string = 'https://api.fireworks.ai/inference/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_FIREWORKS_API_KEY || '';
    console.log('API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (!this.apiKey) {
      console.warn('Hugging Face API key not found. AI analysis will use enhanced fallback logic.');
    }
  }

  async analyzeEntry(entryText: string): Promise<AIAnalysisResult> {
    console.log('Starting AI analysis for entry:', entryText.substring(0, 100) + '...');
    
    if (!this.apiKey) {
      console.log('No API key found, using enhanced content analysis');
      return this.getContentBasedAnalysis(entryText);
    }

    try {
      // Create a more specific prompt for emotional analysis
      const analysisPrompt = this.createAnalysisPrompt(entryText);
      
      console.log('Making API request to Fireworks...');
      
      const response = await axios.post(
        this.apiUrl,
        {
          messages: [
            { role: 'user', content: analysisPrompt }
          ],
          model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      console.log('API Response received:', response.status);

      if (response.data && response.data.choices && response.data.choices[0]) {
        const generatedText = response.data.choices[0].message.content || '';
        console.log('Generated analysis:', generatedText.substring(0, 200) + '...');
        
        return this.parseAIAnalysis(entryText, generatedText);
      } else {
        console.warn('Unexpected API response format, using content-based analysis');
        return this.getContentBasedAnalysis(entryText);
      }
    } catch (error) {
      console.error('Error calling Fireworks API:', error);
      return this.getContentBasedAnalysis(entryText);
    }
  }

  private createAnalysisPrompt(entryText: string): string {
    return `As an empathetic therapist, analyze this journal entry and provide insights:

Entry: "${entryText}"

Please identify:
1. The primary emotion expressed
2. Key themes and concerns
3. Any unhelpful thinking patterns
4. Supportive reflection on the content

Analysis:`;
  }

  private parseAIAnalysis(originalText: string, aiResponse: string): AIAnalysisResult {
    // Extract emotion from AI response and original text
    const emotion = this.extractEmotionFromContent(originalText, aiResponse);
    
    // Detect cognitive distortions in the original text
    const distortions = this.detectCognitiveDistortions(originalText);
    
    // Generate activities based on the specific content and emotion
    const activities = this.generateContextualActivities(originalText, emotion.emotion);
    
    // Create a reflection that references the actual content
    const reflection = this.generateContentBasedReflection(originalText, emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
    };
  }

  private getContentBasedAnalysis(entryText: string): AIAnalysisResult {
    console.log('Using enhanced content-based analysis');
    
    // Analyze the actual content for emotion
    const emotion = this.extractEmotionFromContent(entryText, '');
    
    // Look for specific cognitive distortions in the text
    const distortions = this.detectCognitiveDistortions(entryText);
    
    // Generate activities based on the specific content
    const activities = this.generateContextualActivities(entryText, emotion.emotion);
    
    // Create a reflection that actually references the content
    const reflection = this.generateContentBasedReflection(entryText, emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
    };
  }

  private extractEmotionFromContent(text: string, aiResponse: string = ''): EmotionResult {
    const fullText = (text + ' ' + aiResponse).toLowerCase();
    
    // More sophisticated emotion detection with context
    const emotionIndicators = {
      happy: {
        keywords: ['happy', 'joy', 'excited', 'grateful', 'amazing', 'wonderful', 'great', 'fantastic', 'love', 'blessed', 'thrilled', 'delighted', 'cheerful', 'elated', 'content', 'proud', 'accomplished', 'successful'],
        contextPhrases: ['feeling good', 'went well', 'so glad', 'really enjoyed', 'made me smile', 'feel blessed', 'grateful for'],
        emoji: '😊'
      },
      sad: {
        keywords: ['sad', 'upset', 'down', 'depressed', 'lonely', 'empty', 'hopeless', 'disappointed', 'hurt', 'crying', 'tears', 'melancholy', 'sorrowful', 'heartbroken', 'devastated'],
        contextPhrases: ['feeling down', 'really sad', 'want to cry', 'feel empty', 'so disappointed', 'breaks my heart'],
        emoji: '😢'
      },
      angry: {
        keywords: ['angry', 'frustrated', 'mad', 'furious', 'annoyed', 'irritated', 'rage', 'hate', 'pissed', 'outraged', 'livid', 'irate', 'infuriated'],
        contextPhrases: ['so frustrated', 'really angry', 'makes me mad', 'can\'t stand', 'drives me crazy', 'fed up'],
        emoji: '😠'
      },
      anxious: {
        keywords: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'tense', 'uneasy', 'apprehensive', 'restless', 'fearful'],
        contextPhrases: ['so worried', 'really anxious', 'can\'t stop thinking', 'what if', 'scared that', 'nervous about'],
        emoji: '😰'
      },
      stressed: {
        keywords: ['stressed', 'overwhelmed', 'pressure', 'deadline', 'busy', 'exhausted', 'tired', 'burnt out', 'frazzled', 'strained', 'swamped'],
        contextPhrases: ['so much to do', 'feeling overwhelmed', 'too much pressure', 'can\'t handle', 'burning out'],
        emoji: '😫'
      },
      calm: {
        keywords: ['calm', 'peaceful', 'serene', 'relaxed', 'tranquil', 'centered', 'balanced', 'content', 'zen', 'composed', 'still', 'quiet'],
        contextPhrases: ['feeling calm', 'so peaceful', 'really relaxed', 'at peace', 'centered myself'],
        emoji: '😌'
      }
    };

    let maxScore = 0;
    let detectedEmotion = 'neutral';
    let confidence = 0.6;
    
    for (const [emotion, indicators] of Object.entries(emotionIndicators)) {
      let score = 0;
      
      // Score keywords
      indicators.keywords.forEach(keyword => {
        const matches = (fullText.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        score += matches * 2; // Weight individual keywords
      });
      
      // Score context phrases (higher weight)
      indicators.contextPhrases.forEach(phrase => {
        if (fullText.includes(phrase)) {
          score += 5; // Higher weight for contextual phrases
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
        confidence = Math.min(0.95, 0.7 + (score * 0.05));
      }
    }

    const emoji = emotionIndicators[detectedEmotion as keyof typeof emotionIndicators]?.emoji || '😐';

    return {
      emotion: detectedEmotion,
      emoji,
      confidence
    };
  }

  private generateContentBasedReflection(entryText: string, emotion: string): string {
    // Extract key themes and phrases from the entry
    const sentences = entryText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPhrase = sentences[0]?.trim() || entryText.substring(0, 50);
    
    // Create reflections that reference the actual content
    const contentReflections = {
      happy: [
        `It's wonderful to read about ${this.extractMainSubject(entryText)}. Your positive energy really comes through in your words.`,
        `The joy you describe around ${this.extractMainSubject(entryText)} is beautiful. These moments of happiness are worth celebrating and remembering.`,
        `Your enthusiasm about ${this.extractMainSubject(entryText)} shows how you're able to find and appreciate the good in your life.`
      ],
      sad: [
        `I can feel the weight of what you're going through with ${this.extractMainSubject(entryText)}. Your feelings are completely valid and understandable.`,
        `It takes courage to express these difficult feelings about ${this.extractMainSubject(entryText)}. Acknowledging sadness is an important part of processing it.`,
        `The pain you're experiencing around ${this.extractMainSubject(entryText)} is real, and it's okay to sit with these feelings as you work through them.`
      ],
      anxious: [
        `Your concerns about ${this.extractMainSubject(entryText)} show how much you care. Anxiety often stems from things that matter deeply to us.`,
        `The worry you're feeling about ${this.extractMainSubject(entryText)} is understandable. Sometimes our minds try to prepare us for challenges by imagining different scenarios.`,
        `I can sense the tension you're carrying about ${this.extractMainSubject(entryText)}. Recognizing anxiety is the first step toward managing it effectively.`
      ],
      angry: [
        `Your frustration about ${this.extractMainSubject(entryText)} comes through clearly. Anger often signals that something important to you has been affected.`,
        `The intensity of your feelings about ${this.extractMainSubject(entryText)} shows how much this situation matters to you. Your anger is a valid response.`,
        `I can understand why ${this.extractMainSubject(entryText)} would trigger such strong feelings. Sometimes anger is our way of protecting what we value.`
      ],
      stressed: [
        `The pressure you're feeling around ${this.extractMainSubject(entryText)} sounds overwhelming. It's natural to feel stressed when facing multiple demands.`,
        `Your stress about ${this.extractMainSubject(entryText)} reflects how much responsibility you're carrying. Remember that it's okay to take things one step at a time.`,
        `The overwhelm you're experiencing with ${this.extractMainSubject(entryText)} is a sign that you're juggling a lot right now. Your awareness of this stress is important.`
      ],
      calm: [
        `The peace you've found in ${this.extractMainSubject(entryText)} is beautiful. These moments of calm are precious and worth savoring.`,
        `Your sense of tranquility around ${this.extractMainSubject(entryText)} shows your ability to find balance. This inner peace is a strength you can draw upon.`,
        `The serenity you describe with ${this.extractMainSubject(entryText)} reflects your capacity for mindfulness and presence.`
      ],
      neutral: [
        `Your thoughtful reflection on ${this.extractMainSubject(entryText)} shows a balanced perspective. Sometimes the most profound insights come from quiet observation.`,
        `The way you've described ${this.extractMainSubject(entryText)} demonstrates emotional awareness and self-reflection.`,
        `Your ability to articulate your experience with ${this.extractMainSubject(entryText)} shows emotional intelligence and mindfulness.`
      ]
    };

    const emotionReflections = contentReflections[emotion as keyof typeof contentReflections] || contentReflections.neutral;
    const baseReflection = emotionReflections[Math.floor(Math.random() * emotionReflections.length)];
    
    // Add a personalized insight based on the content
    const insights = [
      " Your self-awareness in expressing these thoughts is a sign of emotional growth.",
      " Taking time to reflect like this shows you're actively working on understanding yourself.",
      " The fact that you're processing these experiences through writing is a healthy coping strategy.",
      " Your willingness to explore these feelings demonstrates resilience and courage.",
      " This kind of honest self-reflection is valuable for your emotional well-being."
    ];
    
    const insight = insights[Math.floor(Math.random() * insights.length)];
    
    return baseReflection + insight;
  }

  private extractMainSubject(text: string): string {
    // Simple extraction of main subject/topic from the text
    const commonSubjects = [
      'work', 'job', 'career', 'meeting', 'project', 'deadline',
      'family', 'friend', 'relationship', 'partner', 'spouse',
      'health', 'exercise', 'sleep', 'stress', 'anxiety',
      'school', 'study', 'exam', 'class', 'learning',
      'home', 'house', 'moving', 'travel', 'vacation',
      'money', 'financial', 'budget', 'bills',
      'future', 'goals', 'dreams', 'plans', 'decisions'
    ];
    
    const lowerText = text.toLowerCase();
    
    for (const subject of commonSubjects) {
      if (lowerText.includes(subject)) {
        return subject;
      }
    }
    
    // If no specific subject found, extract a general theme
    const words = text.split(' ').filter(word => word.length > 4);
    return words[0] || 'this situation';
  }

  private generateContextualActivities(entryText: string, emotion: string): ActivitySuggestion[] {
    const lowerText = entryText.toLowerCase();
    
    // Base activities for each emotion
    const baseActivities: Record<string, ActivitySuggestion[]> = {
      anxious: [
        {
          id: 'breathing-box',
          title: 'Box Breathing',
          description: 'Breathe in for 4, hold for 4, out for 4, hold for 4. This can help calm your nervous system.',
          duration: '3-5 minutes',
          category: 'breathing'
        },
        {
          id: 'grounding-5-4-3-2-1',
          title: '5-4-3-2-1 Grounding',
          description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings you back to the present moment.',
          duration: '5 minutes',
          category: 'grounding'
        }
      ],
      sad: [
        {
          id: 'self-compassion',
          title: 'Self-Compassion Break',
          description: 'Speak to yourself with the same kindness you\'d show a good friend going through this.',
          duration: '5-10 minutes',
          category: 'self-care'
        },
        {
          id: 'gratitude-practice',
          title: 'Gentle Gratitude',
          description: 'Write down one small thing you\'re grateful for today, even if it feels difficult right now.',
          duration: '5 minutes',
          category: 'gratitude'
        }
      ],
      angry: [
        {
          id: 'physical-release',
          title: 'Physical Release',
          description: 'Do jumping jacks, punch a pillow, or go for a brisk walk to release the physical tension.',
          duration: '5-10 minutes',
          category: 'physical'
        },
        {
          id: 'cooling-breath',
          title: 'Cooling Breath',
          description: 'Take slow, deep breaths while counting backwards from 10 to help cool down your anger.',
          duration: '3-5 minutes',
          category: 'breathing'
        }
      ],
      stressed: [
        {
          id: 'priority-setting',
          title: 'Priority Reset',
          description: 'List what\'s stressing you and identify just the top 2 most important things to focus on.',
          duration: '10 minutes',
          category: 'organization'
        },
        {
          id: 'stress-walk',
          title: 'Mindful Walk',
          description: 'Take a 10-minute walk while focusing on your surroundings rather than your stressors.',
          duration: '10-15 minutes',
          category: 'movement'
        }
      ],
      happy: [
        {
          id: 'savor-moment',
          title: 'Savor This Feeling',
          description: 'Take a few minutes to fully experience and appreciate this positive emotion.',
          duration: '5 minutes',
          category: 'mindfulness'
        },
        {
          id: 'share-joy',
          title: 'Share Your Joy',
          description: 'Tell someone about what made you happy or write about it in more detail.',
          duration: '10 minutes',
          category: 'connection'
        }
      ],
      calm: [
        {
          id: 'mindful-observation',
          title: 'Mindful Observation',
          description: 'Spend time observing something beautiful in your environment with full attention.',
          duration: '10 minutes',
          category: 'mindfulness'
        }
      ]
    };

    let activities = baseActivities[emotion] || baseActivities['anxious'];
    
    // Add contextual activities based on content
    if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('meeting')) {
      activities.push({
        id: 'work-boundary',
        title: 'Work Boundary Setting',
        description: 'Take 5 minutes to step away from work thoughts and do something just for you.',
        duration: '5 minutes',
        category: 'boundaries'
      });
    }
    
    if (lowerText.includes('sleep') || lowerText.includes('tired') || lowerText.includes('exhausted')) {
      activities.push({
        id: 'rest-ritual',
        title: 'Rest Preparation',
        description: 'Create a calming environment and prepare your mind and body for quality rest.',
        duration: '15 minutes',
        category: 'rest'
      });
    }
    
    if (lowerText.includes('friend') || lowerText.includes('family') || lowerText.includes('relationship')) {
      activities.push({
        id: 'connection-reach',
        title: 'Reach Out',
        description: 'Consider connecting with someone who makes you feel supported and understood.',
        duration: '10-20 minutes',
        category: 'connection'
      });
    }

    return activities.slice(0, 3); // Return top 3 most relevant activities
  }

  private detectCognitiveDistortions(text: string): CognitiveDistortion[] {
    const distortions: CognitiveDistortion[] = [];
    const lowerText = text.toLowerCase();

    // Catastrophizing detection with actual text examples
    const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless', 'everything', 'nothing'];
    const foundCatastrophizing = catastrophizingWords.filter(word => lowerText.includes(word));
    
    if (foundCatastrophizing.length >= 2) {
      // Find actual sentences with these words
      const sentences = text.split(/[.!?]+/);
      const problematicSentences = sentences.filter(sentence => 
        foundCatastrophizing.some(word => sentence.toLowerCase().includes(word))
      );
      
      distortions.push({
        type: 'Catastrophizing',
        description: 'You might be imagining the worst-case scenario or thinking in extremes about this situation.',
        detectedText: problematicSentences.slice(0, 2),
        evidence: [
          'Most situations have multiple possible outcomes, not just the worst one',
          'You have successfully navigated difficult situations before',
          'Even challenging situations often have solutions or ways to cope'
        ],
        reframingPrompt: 'What evidence do I have that this worst-case scenario will actually happen? What are some more realistic outcomes?'
      });
    }

    // Mind reading detection
    const mindReadingPhrases = ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate', 'they judge', 'they must think'];
    const foundMindReading = mindReadingPhrases.filter(phrase => lowerText.includes(phrase));
    
    if (foundMindReading.length > 0) {
      const sentences = text.split(/[.!?]+/);
      const mindReadingSentences = sentences.filter(sentence => 
        foundMindReading.some(phrase => sentence.toLowerCase().includes(phrase))
      );
      
      distortions.push({
        type: 'Mind Reading',
        description: 'You might be assuming you know what others are thinking without having concrete evidence.',
        detectedText: mindReadingSentences.slice(0, 2),
        evidence: [
          'You cannot know for certain what others are thinking',
          'People often have their own concerns and may not be focused on judging you',
          'There could be many explanations for someone\'s behavior that have nothing to do with you'
        ],
        reframingPrompt: 'What evidence do I actually have about what this person is thinking? What other explanations could there be for their behavior?'
      });
    }

    // All-or-nothing thinking
    const allOrNothingWords = ['completely', 'totally', 'perfect', 'failure', 'useless', 'worthless', 'all', 'none'];
    const foundAllOrNothing = allOrNothingWords.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
    
    if (foundAllOrNothing.length >= 2) {
      const sentences = text.split(/[.!?]+/);
      const blackWhiteSentences = sentences.filter(sentence => 
        foundAllOrNothing.some(word => new RegExp(`\\b${word}\\b`, 'i').test(sentence))
      );
      
      distortions.push({
        type: 'All-or-Nothing Thinking',
        description: 'You might be seeing this situation in black and white, missing the gray areas and partial successes.',
        detectedText: blackWhiteSentences.slice(0, 2),
        evidence: [
          'Most situations exist on a spectrum rather than being completely good or bad',
          'Partial success is still success and worth acknowledging',
          'Learning and growth happen gradually, with ups and downs along the way'
        ],
        reframingPrompt: 'Instead of seeing this as completely good or bad, what middle ground or partial success can I acknowledge?'
      });
    }

    return distortions;
  }
}

export const aiService = new AIService();