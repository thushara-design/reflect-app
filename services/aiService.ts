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
              content: 'You are an expert therapist and emotional intelligence coach. You MUST respond with valid JSON only. Do not include any text before or after the JSON object.' 
            },
            { 
              role: 'user', 
              content: analysisPrompt 
            }
          ],
          model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
          stream: false,
          temperature: 0.3, // Lower temperature for more consistent JSON
          max_tokens: 2000 // Increased to ensure complete responses
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

  private createComprehensiveAnalysisPrompt(entryText: string): string {
    return `Analyze this journal entry and respond with ONLY valid JSON in this exact format:

JOURNAL ENTRY: "${entryText}"

Respond with this JSON structure (no additional text):

{
  "emotion": {
    "primary_emotion": "happy|sad|angry|anxious|stressed|calm|frustrated|excited|lonely|grateful|confused|hopeful|disappointed|content|overwhelmed",
    "confidence": 0.8,
    "explanation": "brief explanation"
  },
  "cognitive_distortions": [
    {
      "type": "catastrophizing",
      "description": "explanation of the distortion",
      "evidence_against": ["fact 1", "fact 2", "fact 3"],
      "reframing_question": "helpful question"
    }
  ],
  "key_themes": ["theme1", "theme2"],
  "reflection": "Compassionate 2-3 sentence reflection",
  "suggested_activities": [
    {
      "title": "activity name",
      "description": "how this helps",
      "duration": "5-10 minutes",
      "category": "breathing"
    }
  ]
}

IMPORTANT: Respond with ONLY the JSON object. No explanatory text before or after.`;
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
        
        // Parse cognitive distortions with validation
        const distortions = this.parseDistortionsFromAI(analysisData.cognitive_distortions || []);
        
        // Parse activities with validation
        const activities = this.parseActivitiesFromAI(analysisData.suggested_activities || []);
        
        // Get reflection with fallback
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
      
      // Fallback to text-based parsing
      return this.parseTextualAIResponse(originalText, aiResponse);
    }
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

  private parseDistortionsFromAI(distortionsData: any[]): CognitiveDistortion[] {
    if (!Array.isArray(distortionsData)) {
      return [];
    }

    return distortionsData.map((distortion, index) => ({
      type: distortion?.type || 'Unhelpful Thinking Pattern',
      description: distortion?.description || 'An unhelpful thinking pattern was detected.',
      detectedText: Array.isArray(distortion?.detected_text) ? distortion.detected_text : 
                   [distortion?.example || 'Pattern detected in text'],
      evidence: Array.isArray(distortion?.evidence_against) ? distortion.evidence_against : [
        'Consider alternative perspectives',
        'Look for evidence that contradicts this thought',
        'Remember past experiences that challenge this pattern'
      ],
      reframingPrompt: distortion?.reframing_question || 'How might I view this situation more objectively?'
    })).slice(0, 3); // Limit to 3 distortions
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
    console.log('Using textual parsing fallback');
    
    // Extract emotion from AI response text
    const emotion = this.extractEmotionFromAIText(aiResponse, originalText);
    
    // Extract distortions mentioned in AI response
    const distortions = this.extractDistortionsFromAIText(aiResponse, originalText);
    
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

  private extractDistortionsFromAIText(aiText: string, originalText: string): CognitiveDistortion[] {
    const distortions: CognitiveDistortion[] = [];
    const lowerAI = aiText.toLowerCase();
    const lowerOriginal = originalText.toLowerCase();

    // Look for distortion mentions in AI response
    const distortionPatterns = {
      'Catastrophizing': {
        aiKeywords: ['catastroph', 'worst case', 'disaster', 'extreme'],
        originalKeywords: ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined'],
        description: 'You might be imagining the worst-case scenario or thinking in extremes about this situation.',
        evidence: [
          'Most situations have multiple possible outcomes, not just the worst one',
          'You have successfully handled difficult situations before',
          'Even challenging situations often have solutions or ways to cope'
        ],
        reframingPrompt: 'What evidence do I have that this worst-case scenario will actually happen? What are some more realistic outcomes?'
      },
      'All-or-Nothing Thinking': {
        aiKeywords: ['black and white', 'all or nothing', 'extreme', 'absolute'],
        originalKeywords: ['completely', 'totally', 'perfect', 'failure', 'always', 'never'],
        description: 'You might be seeing this situation in black and white, missing the gray areas and partial successes.',
        evidence: [
          'Most situations exist on a spectrum rather than being completely good or bad',
          'Partial success is still success and worth acknowledging',
          'Learning and growth happen gradually, with ups and downs along the way'
        ],
        reframingPrompt: 'Instead of seeing this as completely good or bad, what middle ground or partial success can I acknowledge?'
      },
      'Mind Reading': {
        aiKeywords: ['mind reading', 'assuming', 'think you know'],
        originalKeywords: ['they think', 'he thinks', 'she thinks', 'everyone thinks', 'they hate', 'they judge'],
        description: 'You might be assuming you know what others are thinking without having concrete evidence.',
        evidence: [
          'You cannot know for certain what others are thinking',
          'People often have their own concerns and may not be focused on judging you',
          'There could be many explanations for someone\'s behavior that have nothing to do with you'
        ],
        reframingPrompt: 'What evidence do I actually have about what this person is thinking? What other explanations could there be for their behavior?'
      }
    };

    for (const [type, pattern] of Object.entries(distortionPatterns)) {
      const aiMentioned = pattern.aiKeywords.some(keyword => lowerAI.includes(keyword));
      const originalContains = pattern.originalKeywords.some(keyword => lowerOriginal.includes(keyword));

      if (aiMentioned || originalContains) {
        // Find example text from original
        const sentences = originalText.split(/[.!?]+/);
        const exampleSentences = sentences.filter(sentence => 
          pattern.originalKeywords.some(keyword => 
            sentence.toLowerCase().includes(keyword)
          )
        );

        distortions.push({
          type,
          description: pattern.description,
          detectedText: exampleSentences.slice(0, 2),
          evidence: pattern.evidence,
          reframingPrompt: pattern.reframingPrompt
        });
      }
    }

    return distortions.slice(0, 3);
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
    const sentences = entryText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPhrase = sentences[0]?.trim() || entryText.substring(0, 50);
    
    const contentReflections = {
      happy: [
        `It's wonderful to read about the positive experience you've shared. Your joy and enthusiasm really come through in your words.`,
        `The happiness you describe is beautiful to witness. These moments of joy are worth celebrating and remembering.`,
        `Your positive energy is evident in your writing. It's clear you're able to find and appreciate the good in your life.`
      ],
      sad: [
        `I can feel the weight of what you're going through. Your feelings are completely valid and it takes courage to express them.`,
        `The pain you're experiencing comes through in your words. It's okay to sit with these difficult feelings as you process them.`,
        `Your sadness is real and understandable. Acknowledging these feelings is an important part of working through them.`
      ],
      anxious: [
        `The worry and concern you're feeling shows how much you care. Anxiety often stems from things that matter deeply to us.`,
        `I can sense the tension and uncertainty you're carrying. Recognizing anxiety is the first step toward managing it effectively.`,
        `Your anxious thoughts are understandable given what you're facing. Sometimes our minds try to prepare us by imagining different scenarios.`
      ],
      angry: [
        `Your frustration and anger come through clearly in your writing. These intense feelings often signal that something important to you has been affected.`,
        `The strength of your emotions shows how much this situation matters to you. Your anger is a valid response to what you're experiencing.`,
        `I can understand why this would trigger such strong feelings. Sometimes anger is our way of protecting what we value.`
      ],
      frustrated: [
        `The frustration you're experiencing is completely understandable. It's natural to feel this way when things aren't going as planned.`,
        `Your frustration shows that you care deeply about the outcome. These feelings are valid and worth acknowledging.`,
        `I can sense the tension you're feeling when things feel stuck or blocked. This frustration is a normal response to obstacles.`
      ],
      stressed: [
        `The pressure and overwhelm you're feeling sounds incredibly challenging. It's natural to feel stressed when facing multiple demands.`,
        `Your stress reflects how much responsibility you're carrying right now. Remember that it's okay to take things one step at a time.`,
        `The overwhelm you're experiencing shows you're juggling a lot. Your awareness of this stress is an important first step.`
      ],
      calm: [
        `The peace and tranquility you've found is beautiful. These moments of calm are precious and worth savoring.`,
        `Your sense of serenity shows your ability to find balance. This inner peace is a strength you can draw upon.`,
        `The calm you describe reflects your capacity for mindfulness and presence in the moment.`
      ],
      neutral: [
        `Your thoughtful reflection shows a balanced perspective. Sometimes the most profound insights come from quiet observation.`,
        `The way you've described your experience demonstrates emotional awareness and self-reflection.`,
        `Your ability to articulate your thoughts shows emotional intelligence and mindfulness.`
      ]
    };

    const emotionReflections = contentReflections[emotion as keyof typeof contentReflections] || contentReflections.neutral;
    const baseReflection = emotionReflections[Math.floor(Math.random() * emotionReflections.length)];
    
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

  private detectCognitiveDistortions(text: string): CognitiveDistortion[] {
    const distortions: CognitiveDistortion[] = [];
    const lowerText = text.toLowerCase();

    // Catastrophizing detection
    const catastrophizingWords = ['always', 'never', 'worst', 'terrible', 'disaster', 'ruined', 'doomed', 'hopeless', 'everything', 'nothing'];
    const foundCatastrophizing = catastrophizingWords.filter(word => lowerText.includes(word));
    
    if (foundCatastrophizing.length >= 2) {
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