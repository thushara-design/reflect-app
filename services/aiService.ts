import axios from 'axios';
import { EmotionDetector } from './ai/emotionDetector';
import { DistortionDetector } from './ai/distortionDetector';
import { ActivityGenerator } from './ai/activityGenerator';
import { ReflectionGenerator } from './ai/reflectionGenerator';
import { ReframingService } from './ai/reframingService';
import { EmotionalToolkitItem } from '@/contexts/OnboardingContext';
import { 
  EmotionResult, 
  CognitiveDistortion, 
  ActivitySuggestion, 
  AIAnalysisResult 
} from './ai/types';

export {
  EmotionResult,
  CognitiveDistortion,
  ActivitySuggestion,
  AIAnalysisResult
};

class AIService {
  private apiKey: string;
  private apiUrl: string = 'https://api.fireworks.ai/inference/v1/chat/completions';
  
  // Service modules
  private emotionDetector: EmotionDetector;
  private distortionDetector: DistortionDetector;
  private activityGenerator: ActivityGenerator;
  private reflectionGenerator: ReflectionGenerator;
  private reframingService: ReframingService;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_FIREWORKS_API_KEY || '';
    console.log('Fireworks API Key loaded:', this.apiKey ? 'Yes' : 'No');
    if (!this.apiKey) {
      console.warn('Fireworks API key not found. AI analysis will use enhanced fallback logic.');
    }

    // Initialize service modules
    this.emotionDetector = new EmotionDetector();
    this.distortionDetector = new DistortionDetector();
    this.activityGenerator = new ActivityGenerator();
    this.reflectionGenerator = new ReflectionGenerator();
    this.reframingService = new ReframingService(this.apiKey);
  }

  async analyzeEntry(entryText: string, userToolkit: EmotionalToolkitItem[] = [], useAI: boolean = true): Promise<AIAnalysisResult> {
    console.log('Starting analysis for entry:', entryText.substring(0, 100) + '...');
    console.log('AI enabled:', useAI);
    console.log('User toolkit received:', userToolkit);
    
    // If AI is disabled or no API key, use content-based analysis only
    if (!useAI || !this.apiKey) {
      console.log('Using content-based analysis (AI disabled or no API key)');
      return this.getContentBasedAnalysis(entryText, userToolkit, useAI);
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
              content: "You are a kind and thoughtful cognitive behavioral therapist. You MUST respond with valid JSON only — do not include any text before or after the JSON. Don't use the word user.\n\nGently identify any specific harmful cognitive distortions if any, using exact quotes from the user's text where possible. In your reflection, acknowledge the user's emotions and the heart of what they are expressing with care and empathy.\n\nYour goal is to offer a warm mirror, helping the user gently notice their thinking patterns without judgment. "
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
        
        return this.parseAIAnalysis(entryText, generatedText, userToolkit, useAI);
      } else {
        console.warn('Unexpected API response format, using content-based analysis');
        return this.getContentBasedAnalysis(entryText, userToolkit, useAI);
      }
    } catch (error) {
      console.error('Error calling Fireworks API:', error);
      return this.getContentBasedAnalysis(entryText, userToolkit, useAI);
    }
  }

  async generateReframedThought(originalThought: string, distortionType: string, userContext: string): Promise<string> {
    return this.reframingService.generateReframedThought(originalThought, distortionType, userContext);
  }

  private createComprehensiveAnalysisPrompt(entryText: string): string {
    return `Analyze this journal entry for cognitive distortions and emotional content. Find EXACT QUOTES from the user's text that demonstrate unhelpful thinking patterns.

JOURNAL ENTRY: "${entryText}"

Respond with ONLY this JSON structure:

{
  "emotion": {
    "primary_emotion": "happy|sad|angry|anxious|stressed|calm|frustrated|excited|lonely|grateful|confused|hopeful|disappointed|content|overwhelmed",
    "confidence": 0.8,
    "explanation": "brief gentle explanation of why this emotion was detected"
  },
  "cognitive_distortions": [
    {
      "type": "Catastrophizing|All-or-Nothing Thinking|Mind Reading|Fortune Telling|Emotional Reasoning|Mental Filter|Personalization",
      "description": "Give gentle and kind explanation of how this distortion appears in the user's text. Speak directly and gently, as though you are sitting with the person.",
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
- Use phrasing like "It sounds like...", "It feels like you're...", or "Reading this, I sense that you might..."
- Only include cognitive distortions when there is clear and specific evidence in the user’s exact words. Quote those words directly.
- In your reflection, thoughtfully refer to what the user actually shared — their situation, emotions, or experiences — rather than offering general affirmations. Let your response feel seen, not scripted.`;
  }

  private parseAIAnalysis(originalText: string, aiResponse: string, userToolkit: EmotionalToolkitItem[] = [], useAI: boolean = true): AIAnalysisResult {
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
        const emotion = this.emotionDetector.parseEmotionFromAI(analysisData.emotion);
        
        // Parse cognitive distortions with enhanced validation (only if AI is enabled)
        const distortions = useAI 
          ? this.distortionDetector.parseDistortionsFromAI(analysisData.cognitive_distortions || [], originalText)
          : [];
        
        // Generate activities with user toolkit integration
        const activities = this.activityGenerator.generateContextualActivities(
          originalText, 
          emotion.emotion, 
          aiResponse,
          userToolkit,
          useAI
        );
        
        // Get reflection from AI or generate content-based one
        const reflection = analysisData.reflection || this.reflectionGenerator.generateContentBasedReflection(originalText, emotion.emotion);

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
      return this.parseTextualAIResponse(originalText, aiResponse, userToolkit, useAI);
    }
  }

  private parseTextualAIResponse(originalText: string, aiResponse: string, userToolkit: EmotionalToolkitItem[] = [], useAI: boolean = true): AIAnalysisResult {
    console.log('Using enhanced textual parsing fallback');
    
    // Extract emotion from AI response text
    const emotion = this.emotionDetector.detectEmotion(originalText, aiResponse);
    
    // Extract distortions mentioned in AI response with better detection (only if AI enabled)
    const distortions = useAI ? this.distortionDetector.detectCognitiveDistortions(originalText) : [];
    
    // Generate activities based on AI insights and emotion with user toolkit
    const activities = this.activityGenerator.generateContextualActivities(
      originalText, 
      emotion.emotion, 
      aiResponse,
      userToolkit,
      useAI
    );
    
    // Extract or generate reflection
    const reflection = this.extractReflectionFromAIText(aiResponse) || 
                      this.reflectionGenerator.generateContentBasedReflection(originalText, emotion.emotion);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
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

  private getContentBasedAnalysis(entryText: string, userToolkit: EmotionalToolkitItem[] = [], useAI: boolean = true): AIAnalysisResult {
    console.log('Using enhanced content-based analysis');
    console.log('User toolkit in content-based analysis:', userToolkit);
    
    const emotion = this.emotionDetector.detectEmotion(entryText, '');
    
    // Only detect distortions if AI is enabled
    const distortions = useAI ? this.distortionDetector.detectCognitiveDistortions(entryText) : [];
    
    const activities = this.activityGenerator.generateContextualActivities(
      entryText, 
      emotion.emotion, 
      '',
      userToolkit,
      useAI
    );
    const reflection = this.reflectionGenerator.generateContentBasedReflection(entryText, emotion.emotion);

    console.log('Content-based analysis complete. Activities:', activities);

    return {
      emotion,
      distortions,
      activities,
      suggestedEmoji: emotion.emoji,
      reflection
    };
  }
}

export const aiService = new AIService();