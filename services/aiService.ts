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
  userQuotes: string[];
  evidence: string[];
  reframingPrompt: string;
  severity: 'low' | 'medium' | 'high';
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
    console.log('Fireworks API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (!this.apiKey) {
      console.warn('Fireworks API key not found. AI analysis will use enhanced fallback logic.');
    }
  }

  async analyzeEntry(entryText: string): Promise<AIAnalysisResult> {
    console.log('Starting AI analysis for entry:', entryText.substring(0, 100) + '...');
    
    if (!this.apiKey) {
      console.log('No API key found, using enhanced content analysis');
      return this.getContentBasedAnalysis(entryText);
    }

    try {
      // Get comprehensive analysis from Fireworks API
      const analysisPrompt = this.createComprehensiveAnalysisPrompt(entryText);
      
      console.log('Making API request to Fireworks...');
      
      const response = await axios.post(
        this.apiUrl,
        {
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert cognitive behavioral therapist. You MUST respond with valid JSON only. Do not include any text before or after the JSON object. Focus on identifying specific cognitive distortions with exact quotes from the user\'s text. For the reflection, acknowledge the specific content and emotions from the user\'s entry.' 
            },
            { 
              role: 'user', 
              content: analysisPrompt 
            }
          ],
          model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
          stream: false,
          temperature: 0.2, // Even lower for more consistent analysis
          max_tokens: 2500 // Increased for detailed analysis
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('API Response received:', response.status);

      if (response.data && response.data.choices && response.data.choices[0]) {
        const generatedText = response.data.choices[0].message.content || '';
        console.log('Generated analysis (first 300 chars):', generatedText.substring(0, 300));
        
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

  async generateReframedThought(originalThought: string, distortionType: string, userContext: string): Promise<string> {
    if (!this.apiKey) {
      return this.generateFallbackReframe(originalThought, distortionType);
    }

    try {
      const reframingPrompt = `As a cognitive behavioral therapist, help reframe this unhelpful thought:

ORIGINAL THOUGHT: "${originalThought}"
DISTORTION TYPE: ${distortionType}
USER CONTEXT: "${userContext}"

Provide a more balanced, realistic reframe that:
1. Acknowledges the person's feelings
2. Challenges the distortion with evidence
3. Offers a more balanced perspective
4. Is written in first person ("I" statements)

Respond with ONLY the reframed thought, no additional text:`;

      const response = await axios.post(
        this.apiUrl,
        {
          messages: [
            { 
              role: 'system', 
              content: 'You are a cognitive behavioral therapist helping someone reframe unhelpful thoughts. Respond with only the reframed thought, nothing else.' 
            },
            { 
              role: 'user', 
              content: reframingPrompt 
            }
          ],
          model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
          stream: false,
          temperature: 0.3,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        const reframedThought = response.data.choices[0].message.content?.trim() || '';
        return reframedThought || this.generateFallbackReframe(originalThought, distortionType);
      }
    } catch (error) {
      console.error('Error generating reframed thought:', error);
    }

    return this.generateFallbackReframe(originalThought, distortionType);
  }

  private generateFallbackReframe(originalThought: string, distortionType: string): string {
    const reframingTemplates: Record<string, string[]> = {
      'Catastrophizing': [
        'While this situation is challenging, I can handle it step by step. Most outcomes aren\'t as extreme as I initially fear.',
        'I\'ve faced difficult situations before and found ways through them. This situation likely has multiple possible outcomes.',
        'Instead of focusing on the worst case, I can prepare for realistic scenarios and trust in my ability to cope.'
      ],
      'All-or-Nothing Thinking': [
        'This situation isn\'t completely good or bad - there are aspects I can acknowledge and learn from.',
        'Progress happens gradually. Even partial success is still meaningful progress toward my goals.',
        'I can recognize the gray areas in this situation rather than seeing it as completely one way or another.'
      ],
      'Mind Reading': [
        'I don\'t actually know what others are thinking. There could be many explanations for their behavior that have nothing to do with me.',
        'People are usually focused on their own concerns. I can\'t read minds, so I\'ll focus on what I actually know.',
        'Instead of assuming what others think, I can communicate directly or focus on my own actions and responses.'
      ],
      'Fortune Telling': [
        'I cannot predict the future with certainty. I can prepare for different outcomes while staying open to possibilities.',
        'While I feel uncertain about what will happen, I can focus on what I can control right now.',
        'My predictions about the future are just thoughts, not facts. I can take positive action despite uncertainty.'
      ],
      'Emotional Reasoning': [
        'Just because I feel this way doesn\'t mean it\'s completely true. My emotions are valid, but they don\'t define reality.',
        'I can acknowledge my feelings while also looking at the facts of the situation objectively.',
        'My emotions are giving me information, but I can also consider evidence that might contradict how I\'m feeling.'
      ]
    };

    const templates = reframingTemplates[distortionType] || reframingTemplates['Catastrophizing'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private createComprehensiveAnalysisPrompt(entryText: string): string {
    return `Analyze this journal entry for cognitive distortions and emotional content. Find EXACT QUOTES from the user's text that demonstrate unhelpful thinking patterns.

JOURNAL ENTRY: "${entryText}"

Respond with ONLY this JSON structure:

{
  "emotion": {
    "primary_emotion": "happy|sad|angry|anxious|stressed|calm|frustrated|excited|lonely|grateful|confused|hopeful|disappointed|content|overwhelmed",
    "confidence": 0.8,
    "explanation": "brief explanation of why this emotion was detected"
  },
  "cognitive_distortions": [
    {
      "type": "Catastrophizing|All-or-Nothing Thinking|Mind Reading|Fortune Telling|Emotional Reasoning|Mental Filter|Personalization",
      "description": "Specific explanation of how this distortion appears in the user's text",
      "user_quotes": ["exact quote 1 from user", "exact quote 2 from user"],
      "severity": "low|medium|high",
      "evidence_against": ["challenging fact 1", "challenging fact 2", "challenging fact 3"],
      "reframing_question": "helpful question to challenge this thought"
    }
  ],
  "key_themes": ["theme1", "theme2", "theme3"],
  "reflection": "A warm, empathetic 1-2 sentence reflection that specifically acknowledges what the user wrote about and validates their emotional experience. Reference actual content from their entry, not generic statements.",
  "suggested_activities": [
    {
      "title": "specific activity name",
      "description": "how this activity helps with the detected emotion/situation",
      "duration": "5-10 minutes",
      "category": "breathing|movement|mindfulness|journaling|social"
    }
  ]
}

CRITICAL: 
- Only include cognitive distortions if you find CLEAR evidence in the user's exact words. Include the exact quotes that demonstrate the distortion.
- For the reflection, specifically reference what the user wrote about (their situation, feelings, experiences) rather than giving generic emotional validation.`;
  }

  private parseAIAnalysis(originalText: string, aiResponse: string): AIAnalysisResult {
    try {
      // Clean the response - remove any text before the first { and after the last }
      let cleanedResponse = aiResponse.trim();
      
      // Find the first { and last }
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
        
        console.log('Attempting to parse cleaned JSON:', cleanedResponse.substring(0, 200) + '...');
        
        const analysisData = JSON.parse(cleanedResponse);
        
        // Parse emotion with validation
        const emotion = this.parseEmotionFromAI(analysisData.emotion);
        
        // Parse cognitive distortions with enhanced validation
        const distortions = this.parseDistortionsFromAI(analysisData.cognitive_distortions || [], originalText);
        
        // Parse activities with validation
        const activities = this.parseActivitiesFromAI(analysisData.suggested_activities || []);
        
        // Get reflection from AI or generate content-based one
        const reflection = analysisData.reflection || this.generateContentBasedReflection(originalText, emotion.emotion);

        console.log('Successfully parsed AI analysis');
        
        return {
          emotion,
          distortions,
          activities,
          suggestedEmoji: emotion.emoji,
          reflection
        };
      } else {
        throw new Error('No valid JSON structure found');
      }
    } catch (error) {
      console.warn('Failed to parse AI JSON response:', error);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback to enhanced text-based parsing
      return this.parseTextualAIResponse(originalText, aiResponse);
    }
  }

  private parseDistortionsFromAI(distortionsData: any[], originalText: string): CognitiveDistortion[] {
    if (!Array.isArray(distortionsData)) {
      return this.detectCognitiveDistortions(originalText);
    }

    const parsedDistortions = distortionsData.map((distortion) => {
      // Validate user quotes are actually from the original text
      const userQuotes = Array.isArray(distortion?.user_quotes) 
        ? distortion.user_quotes.filter((quote: string) => 
            originalText.toLowerCase().includes(quote.toLowerCase().trim())
          )
        : [];

      // If no valid quotes found, try to find relevant sentences
      const detectedText = userQuotes.length > 0 
        ? userQuotes 
        : this.findRelevantSentences(originalText, distortion?.type || '');

      return {
        type: distortion?.type || 'Unhelpful Thinking Pattern',
        description: distortion?.description || 'An unhelpful thinking pattern was detected in your entry.',
        detectedText: detectedText,
        userQuotes: userQuotes,
        evidence: Array.isArray(distortion?.evidence_against) ? distortion.evidence_against : [
          'Consider alternative perspectives on this situation',
          'Look for evidence that contradicts this thought',
          'Remember past experiences that challenge this pattern'
        ],
        reframingPrompt: distortion?.reframing_question || 'How might I view this situation more objectively?',
        severity: distortion?.severity || 'medium'
      };
    }).filter(d => d.detectedText.length > 0); // Only include distortions with evidence

    return parsedDistortions.slice(0, 3); // Limit to 3 distortions
  }

  private findRelevantSentences(text: string, distortionType: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    const distortionKeywords: Record<string, string[]> = {
      'Catastrophizing': ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless'],
      'All-or-Nothing Thinking': ['completely', 'totally', 'perfect', 'failure', 'useless', 'worthless', 'all', 'none'],
      'Mind Reading': ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate', 'they judge'],
      'Fortune Telling': ['will never', 'going to fail', 'won\'t work', 'always happen', 'bound to'],
      'Emotional Reasoning': ['feel like', 'must be true', 'because I feel', 'feeling means']
    };

    const keywords = distortionKeywords[distortionType] || [];
    
    const relevantSentences = sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );

    return relevantSentences.slice(0, 2);
  }

  private parseEmotionFromAI(emotionData: any): EmotionResult {
    const emotionMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      stressed: '😫',
      calm: '😌',
      frustrated: '😤',
      excited: '🤗',
      lonely: '😔',
      grateful: '🙏',
      confused: '😕',
      hopeful: '🌟',
      disappointed: '😞',
      content: '😊',
      overwhelmed: '😵‍💫'
    };

    // Validate and extract emotion data
    const emotion = emotionData?.primary_emotion || 'neutral';
    let confidence = emotionData?.confidence || 0.7;
    
    // Ensure confidence is a valid number between 0.1 and 1.0
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      confidence = 0.7;
    }
    confidence = Math.min(1.0, Math.max(0.1, confidence));
    
    const emoji = emotionMap[emotion] || '😐';

    return {
      emotion,
      emoji,
      confidence
    };
  }

  private parseActivitiesFromAI(activitiesData: any[]): ActivitySuggestion[] {
    if (!Array.isArray(activitiesData)) {
      return [];
    }

    return activitiesData.map((activity, index) => ({
      id: `ai-activity-${index}`,
      title: activity?.title || 'Mindful Activity',
      description: activity?.description || 'A helpful activity based on your current state.',
      duration: activity?.duration || '5-10 minutes',
      category: activity?.category || 'mindfulness'
    })).slice(0, 4); // Limit to 4 activities
  }

  private parseTextualAIResponse(originalText: string, aiResponse: string): AIAnalysisResult {
    console.log('Using enhanced textual parsing fallback');
    
    // Extract emotion from AI response text
    const emotion = this.extractEmotionFromAIText(aiResponse, originalText);
    
    // Extract distortions mentioned in AI response with better detection
    const distortions = this.detectCognitiveDistortions(originalText);
    
    // Generate activities based on AI insights and emotion
    const activities = this.generateContextualActivities(originalText, emotion.emotion, aiResponse);
    
    // Extract or generate reflection
    const reflection = this.extractReflectionFromAIText(aiResponse) || 
                      this.generateContentBasedReflection(originalText, emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
    };
  }

  private extractEmotionFromAIText(aiText: string, originalText: string): EmotionResult {
    const combinedText = (aiText + ' ' + originalText).toLowerCase();
    
    const emotionPatterns = {
      happy: {
        keywords: ['happy', 'joy', 'excited', 'grateful', 'positive', 'cheerful', 'elated', 'content', 'pleased', 'delighted'],
        emoji: '😊'
      },
      sad: {
        keywords: ['sad', 'upset', 'down', 'depressed', 'melancholy', 'sorrowful', 'heartbroken', 'disappointed', 'grief'],
        emoji: '😢'
      },
      anxious: {
        keywords: ['anxious', 'worried', 'nervous', 'fearful', 'apprehensive', 'uneasy', 'concerned', 'tense'],
        emoji: '😰'
      },
      angry: {
        keywords: ['angry', 'frustrated', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged'],
        emoji: '😠'
      },
      stressed: {
        keywords: ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted', 'strained', 'frazzled'],
        emoji: '😫'
      },
      frustrated: {
        keywords: ['frustrated', 'annoyed', 'irritated', 'fed up', 'stuck', 'blocked'],
        emoji: '😤'
      },
      calm: {
        keywords: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'centered', 'balanced'],
        emoji: '😌'
      }
    };

    let maxScore = 0;
    let detectedEmotion = 'neutral';
    let confidence = 0.6;

    for (const [emotion, data] of Object.entries(emotionPatterns)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        const matches = (combinedText.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        score += matches;
      });

      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
        confidence = Math.min(0.95, 0.6 + (score * 0.1));
      }
    }

    const emoji = emotionPatterns[detectedEmotion as keyof typeof emotionPatterns]?.emoji || '😐';

    return {
      emotion: detectedEmotion,
      emoji,
      confidence
    };
  }

  private extractReflectionFromAIText(aiText: string): string | null {
    // Look for reflection-like content in AI response
    const sentences = aiText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Find sentences that sound like reflections
    const reflectionSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return lower.includes('feel') || lower.includes('understand') || 
             lower.includes('experience') || lower.includes('emotion') ||
             lower.includes('valid') || lower.includes('natural') ||
             lower.includes('acknowledge') || lower.includes('recognize');
    });

    if (reflectionSentences.length > 0) {
      return reflectionSentences.slice(0, 2).join('. ').trim() + '.';
    }

    return null;
  }

  private generateContextualActivities(entryText: string, emotion: string, aiInsights: string = ''): ActivitySuggestion[] {
    const lowerText = entryText.toLowerCase();
    const lowerAI = aiInsights.toLowerCase();
    
    // Base activities for each emotion
    const baseActivities: Record<string, ActivitySuggestion[]> = {
      anxious: [
        {
          id: 'breathing-box',
          title: 'Box Breathing',
          description: 'Breathe in for 4, hold for 4, out for 4, hold for 4. This can help calm your nervous system when feeling anxious.',
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
          description: 'Speak to yourself with the same kindness you\'d show a good friend going through this difficult time.',
          duration: '5-10 minutes',
          category: 'self-care'
        },
        {
          id: 'gentle-movement',
          title: 'Gentle Movement',
          description: 'Take a slow walk or do some gentle stretching to help process these emotions physically.',
          duration: '10-15 minutes',
          category: 'movement'
        }
      ],
      angry: [
        {
          id: 'physical-release',
          title: 'Physical Release',
          description: 'Do jumping jacks, punch a pillow, or go for a brisk walk to release the physical tension from anger.',
          duration: '5-10 minutes',
          category: 'physical'
        },
        {
          id: 'cooling-breath',
          title: 'Cooling Breath',
          description: 'Take slow, deep breaths while counting backwards from 10 to help cool down intense emotions.',
          duration: '3-5 minutes',
          category: 'breathing'
        }
      ],
      stressed: [
        {
          id: 'priority-reset',
          title: 'Priority Reset',
          description: 'List what\'s stressing you and identify just the top 2 most important things to focus on right now.',
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
      frustrated: [
        {
          id: 'frustration-release',
          title: 'Frustration Release',
          description: 'Write down what\'s frustrating you, then crumple up the paper and throw it away as a symbolic release.',
          duration: '5-10 minutes',
          category: 'expression'
        },
        {
          id: 'progressive-relaxation',
          title: 'Progressive Muscle Relaxation',
          description: 'Tense and release each muscle group to help release physical tension from frustration.',
          duration: '10-15 minutes',
          category: 'relaxation'
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
          id: 'gratitude-expansion',
          title: 'Expand Your Gratitude',
          description: 'Write about what specifically made you feel this way and how you can create more moments like this.',
          duration: '10 minutes',
          category: 'gratitude'
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

    let activities = [...(baseActivities[emotion] || baseActivities['anxious'])];
    
    // Add contextual activities based on content and AI insights
    if (lowerText.includes('work') || lowerText.includes('job') || lowerAI.includes('work')) {
      activities.push({
        id: 'work-boundary',
        title: 'Work Boundary Setting',
        description: 'Take 5 minutes to step away from work thoughts and do something just for you.',
        duration: '5 minutes',
        category: 'boundaries'
      });
    }
    
    if (lowerText.includes('relationship') || lowerText.includes('friend') || lowerAI.includes('social')) {
      activities.push({
        id: 'connection-reach',
        title: 'Reach Out',
        description: 'Consider connecting with someone who makes you feel supported and understood.',
        duration: '10-20 minutes',
        category: 'connection'
      });
    }

    if (lowerText.includes('sleep') || lowerText.includes('tired') || lowerAI.includes('rest')) {
      activities.push({
        id: 'rest-ritual',
        title: 'Rest Preparation',
        description: 'Create a calming environment and prepare your mind and body for quality rest.',
        duration: '15 minutes',
        category: 'rest'
      });
    }

    return activities.slice(0, 4); // Return top 4 most relevant activities
  }

  private getContentBasedAnalysis(entryText: string): AIAnalysisResult {
    console.log('Using enhanced content-based analysis');
    
    const emotion = this.extractEmotionFromContent(entryText, '');
    const distortions = this.detectCognitiveDistortions(entryText);
    const activities = this.generateContextualActivities(entryText, emotion.emotion);
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
      ],
      anxious: {
        keywords: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'tense', 'uneasy', 'apprehensive', 'restless', 'fearful'],
        contextPhrases: ['so worried', 'really anxious', 'can\'t stop thinking', 'what if', 'scared that', 'nervous about'],
        emoji: '😰'
      },
      stressed: {
        keywords: ['stressed', 'overwhelmed', 'pressure', 'deadline', 'busy', 'exhausted', 'tired', 'burnt out', 'frazzled', 'strained', 'swamped'],
        contextPhrases: ['so much to do', 'feeling overwhelmed', 'too much pressure', 'can\'t handle', 'burning out'],
        emoji: '😫'
      ],
      frustrated: {
        keywords: ['frustrated', 'annoyed', 'irritated', 'fed up', 'stuck', 'blocked', 'hindered', 'thwarted'],
        contextPhrases: ['so frustrated', 'really annoying', 'can\'t get', 'not working', 'keeps failing'],
        emoji: '😤'
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
      
      indicators.keywords.forEach(keyword => {
        const matches = (fullText.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        score += matches * 2;
      });
      
      indicators.contextPhrases.forEach(phrase => {
        if (fullText.includes(phrase)) {
          score += 5;
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
    // Extract key themes and content from the entry
    const sentences = entryText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const firstSentence = sentences[0]?.trim() || '';
    const lowerText = entryText.toLowerCase();
    
    // Identify key subjects/themes in the entry
    const subjects = this.extractMainSubjects(entryText);
    const mainSubject = subjects[0] || 'this situation';
    
    // Create content-aware reflections based on what the user actually wrote about
    const generateSpecificReflection = (emotion: string, subject: string, content: string): string => {
      const lowerContent = content.toLowerCase();
      
      // Detect specific situations mentioned
      if (lowerContent.includes('meeting') || lowerContent.includes('presentation') || lowerContent.includes('speaking')) {
        if (emotion === 'anxious' || emotion === 'nervous') {
          return `I can understand how speaking up in meetings would feel nerve-wracking - your heart racing shows how much you care about contributing meaningfully.`;
        }
      }
      
      if (lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('deadline')) {
        if (emotion === 'stressed' || emotion === 'overwhelmed') {
          return `The work pressure you're describing sounds genuinely challenging - feeling overwhelmed when juggling multiple demands is completely natural.`;
        }
        if (emotion === 'frustrated') {
          return `Your frustration with the work situation comes through clearly - it's understandable when professional challenges feel blocking or difficult.`;
        }
      }
      
      if (lowerContent.includes('friend') || lowerContent.includes('relationship') || lowerContent.includes('family')) {
        if (emotion === 'sad' || emotion === 'hurt') {
          return `The pain you're feeling in this relationship situation is real - interpersonal challenges can be some of the most difficult to navigate.`;
        }
        if (emotion === 'happy' || emotion === 'grateful') {
          return `The joy you're experiencing in your relationships really shines through - these connections clearly mean a lot to you.`;
        }
      }
      
      if (lowerContent.includes('sleep') || lowerContent.includes('tired') || lowerContent.includes('exhausted')) {
        return `The exhaustion you're describing sounds draining - your body and mind are telling you something important about needing rest.`;
      }
      
      if (lowerContent.includes('progress') || lowerContent.includes('routine') || lowerContent.includes('consistent')) {
        if (emotion === 'happy' || emotion === 'content') {
          return `Your awareness of the positive changes in your routine is wonderful - recognizing progress, even small steps, shows real self-awareness.`;
        }
      }
      
      // Generic but content-aware fallbacks
      const emotionReflections: Record<string, string[]> = {
        anxious: [
          `The worry you're expressing about ${subject} shows how much this matters to you - anxiety often reflects our deepest cares.`,
          `I can feel the tension you're carrying about ${subject} - these concerns make sense given what you're facing.`,
          `Your nervousness around ${subject} is completely understandable - it takes courage to acknowledge these feelings.`
        ],
        sad: [
          `The sadness you're feeling about ${subject} comes through in your words - these emotions deserve acknowledgment and space.`,
          `I can sense the weight you're carrying regarding ${subject} - it's natural to feel this way when facing difficult situations.`,
          `Your pain around ${subject} is valid - allowing yourself to feel these emotions is part of processing them.`
        ],
        angry: [
          `The frustration you're experiencing with ${subject} is palpable - anger often signals that something important to you has been affected.`,
          `Your strong feelings about ${subject} show how much this situation matters to you - these emotions are completely valid.`,
          `I can understand why ${subject} would trigger such intense feelings - sometimes anger is our way of protecting what we value.`
        ],
        frustrated: [
          `The frustration you're feeling with ${subject} is completely understandable - it's natural when things aren't going as hoped.`,
          `Your sense of being stuck with ${subject} comes through clearly - these feelings of blockage are valid and worth acknowledging.`,
          `The tension you're experiencing around ${subject} makes perfect sense - frustration often arises when we care deeply about outcomes.`
        ],
        stressed: [
          `The overwhelm you're feeling about ${subject} sounds genuinely challenging - you're managing a lot right now.`,
          `Your stress regarding ${subject} is completely valid - it's natural to feel this way when facing pressure.`,
          `The burden you're carrying with ${subject} comes through in your words - recognizing this stress is an important first step.`
        ],
        happy: [
          `The joy you're experiencing with ${subject} is beautiful to witness - your positive energy really shines through.`,
          `Your happiness about ${subject} is wonderful to read about - these moments of joy are worth celebrating.`,
          `The contentment you're feeling around ${subject} is lovely - it's clear this brings you genuine satisfaction.`
        ],
        calm: [
          `The peace you've found in ${subject} is beautiful - these moments of tranquility are precious and worth savoring.`,
          `Your sense of calm regarding ${subject} shows your ability to find balance - this inner peace is a real strength.`,
          `The serenity you're experiencing with ${subject} comes through clearly - it's wonderful when we can find this stillness.`
        ],
        grateful: [
          `The gratitude you're expressing about ${subject} is touching - your appreciation for these moments shows real awareness.`,
          `Your thankfulness regarding ${subject} really shines through - this perspective is a beautiful way to approach life.`,
          `The appreciation you're feeling for ${subject} is wonderful - recognizing these gifts shows emotional wisdom.`
        ]
      };
      
      const templates = emotionReflections[emotion] || [
        `Your feelings about ${subject} are completely valid - the way you've expressed this shows real emotional awareness.`,
        `What you're experiencing with ${subject} makes perfect sense - your ability to reflect on this shows insight.`,
        `The emotions you're processing around ${subject} deserve acknowledgment - this kind of self-reflection is valuable.`
      ];
      
      return templates[Math.floor(Math.random() * templates.length)];
    };
    
    return generateSpecificReflection(emotion, mainSubject, entryText);
  }

  private extractMainSubjects(text: string): string[] {
    const lowerText = text.toLowerCase();
    const subjects: string[] = [];
    
    // Common subject patterns
    const subjectPatterns = [
      { pattern: /\b(meeting|presentation|speaking|conference|interview)\b/g, subject: 'the meeting situation' },
      { pattern: /\b(work|job|career|office|deadline|project|boss|colleague)\b/g, subject: 'work' },
      { pattern: /\b(friend|friendship|relationship|partner|spouse|family|parent|sibling)\b/g, subject: 'your relationships' },
      { pattern: /\b(school|study|exam|class|university|college|homework)\b/g, subject: 'your studies' },
      { pattern: /\b(health|doctor|medical|illness|pain|therapy)\b/g, subject: 'your health' },
      { pattern: /\b(sleep|tired|exhausted|insomnia|rest)\b/g, subject: 'your sleep and energy' },
      { pattern: /\b(money|financial|budget|bills|debt|income)\b/g, subject: 'financial matters' },
      { pattern: /\b(future|goals|dreams|plans|decisions|choice)\b/g, subject: 'your future plans' },
      { pattern: /\b(routine|habit|progress|improvement|change)\b/g, subject: 'your personal growth' },
      { pattern: /\b(home|house|apartment|moving|living)\b/g, subject: 'your living situation' }
    ];
    
    for (const { pattern, subject } of subjectPatterns) {
      if (pattern.test(lowerText)) {
        subjects.push(subject);
      }
    }
    
    // If no specific subjects found, try to extract from first sentence
    if (subjects.length === 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        // Extract potential subjects from first sentence
        const words = firstSentence.split(' ').filter(word => word.length > 4);
        if (words.length > 0) {
          subjects.push('what you\'re going through');
        }
      }
    }
    
    return subjects.length > 0 ? subjects : ['this situation'];
  }

  private detectCognitiveDistortions(text: string): CognitiveDistortion[] {
    const distortions: CognitiveDistortion[] = [];
    const lowerText = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);

    // Enhanced Catastrophizing detection
    const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless', 'everything', 'nothing', 'completely destroyed', 'total failure'];
    const foundCatastrophizing = catastrophizingWords.filter(word => lowerText.includes(word));
    
    if (foundCatastrophizing.length >= 2) {
      const problematicSentences = sentences.filter(sentence => 
        foundCatastrophizing.some(word => sentence.toLowerCase().includes(word))
      );
      
      distortions.push({
        type: 'Catastrophizing',
        description: `You're imagining the worst-case scenario. Words like "${foundCatastrophizing.join('", "')}" suggest you might be thinking in extremes about this situation.`,
        detectedText: problematicSentences.slice(0, 2),
        userQuotes: problematicSentences.slice(0, 2),
        evidence: [
          'Most situations have multiple possible outcomes, not just the worst one',
          'You have successfully navigated difficult situations before',
          'Even challenging situations often have solutions or ways to cope',
          'Extreme outcomes are statistically less likely than moderate ones'
        ],
        reframingPrompt: 'What evidence do I have that this worst-case scenario will actually happen? What are some more realistic outcomes?',
        severity: foundCatastrophizing.length >= 4 ? 'high' : 'medium'
      });
    }

    // Enhanced Mind reading detection
    const mindReadingPhrases = ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate', 'they judge', 'they must think', 'probably thinks', 'they\'re thinking'];
    const foundMindReading = mindReadingPhrases.filter(phrase => lowerText.includes(phrase));
    
    if (foundMindReading.length > 0) {
      const mindReadingSentences = sentences.filter(sentence => 
        foundMindReading.some(phrase => sentence.toLowerCase().includes(phrase))
      );
      
      distortions.push({
        type: 'Mind Reading',
        description: `You're assuming you know what others are thinking without concrete evidence. Phrases like "${foundMindReading.join('", "')}" suggest you might be mind reading.`,
        detectedText: mindReadingSentences.slice(0, 2),
        userQuotes: mindReadingSentences.slice(0, 2),
        evidence: [
          'You cannot know for certain what others are thinking',
          'People often have their own concerns and may not be focused on judging you',
          'There could be many explanations for someone\'s behavior that have nothing to do with you',
          'Most people are more focused on themselves than on judging others'
        ],
        reframingPrompt: 'What evidence do I actually have about what this person is thinking? What other explanations could there be for their behavior?',
        severity: mindReadingSentences.length >= 2 ? 'high' : 'medium'
      });
    }

    // Enhanced All-or-nothing thinking
    const allOrNothingWords = ['completely', 'totally', 'perfect', 'failure', 'useless', 'worthless', 'all', 'none', 'entirely', 'absolutely'];
    const foundAllOrNothing = allOrNothingWords.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    });
    
    if (foundAllOrNothing.length >= 2) {
      const blackWhiteSentences = sentences.filter(sentence => 
        foundAllOrNothing.some(word => new RegExp(`\\b${word}\\b`, 'i').test(sentence))
      );
      
      distortions.push({
        type: 'All-or-Nothing Thinking',
        description: `You're seeing this situation in black and white terms. Words like "${foundAllOrNothing.join('", "')}" suggest you might be missing the gray areas and partial successes.`,
        detectedText: blackWhiteSentences.slice(0, 2),
        userQuotes: blackWhiteSentences.slice(0, 2),
        evidence: [
          'Most situations exist on a spectrum rather than being completely good or bad',
          'Partial success is still success and worth acknowledging',
          'Learning and growth happen gradually, with ups and downs along the way',
          'Very few things in life are truly "all" or "nothing"'
        ],
        reframingPrompt: 'Instead of seeing this as completely good or bad, what middle ground or partial success can I acknowledge?',
        severity: foundAllOrNothing.length >= 4 ? 'high' : 'medium'
      });
    }

    // Fortune Telling detection
    const fortuneTellingPhrases = ['will never', 'going to fail', 'won\'t work', 'always happen', 'bound to', 'definitely will', 'for sure will'];
    const foundFortuneTelling = fortuneTellingPhrases.filter(phrase => lowerText.includes(phrase));
    
    if (foundFortuneTelling.length > 0) {
      const fortuneTellingSentences = sentences.filter(sentence => 
        foundFortuneTelling.some(phrase => sentence.toLowerCase().includes(phrase))
      );
      
      distortions.push({
        type: 'Fortune Telling',
        description: `You're predicting negative outcomes without sufficient evidence. Phrases like "${foundFortuneTelling.join('", "')}" suggest you might be fortune telling.`,
        detectedText: fortuneTellingSentences.slice(0, 2),
        userQuotes: fortuneTellingSentences.slice(0, 2),
        evidence: [
          'The future is uncertain and has many possible outcomes',
          'You cannot predict the future with complete accuracy',
          'Past negative experiences don\'t guarantee future negative outcomes',
          'You have influence over many factors that affect outcomes'
        ],
        reframingPrompt: 'What evidence do I have that this prediction will come true? What positive actions can I take to influence the outcome?',
        severity: 'medium'
      });
    }

    return distortions.slice(0, 3); // Limit to top 3 most significant distortions
  }
}

export const aiService = new AIService();