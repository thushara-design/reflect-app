import axios from 'axios';
import { EmotionDetector } from './ai/emotionDetector';
import { DistortionDetector } from './ai/distortionDetector';
import { ActivityGenerator } from './ai/activityGenerator';
import { ReflectionGenerator } from './ai/reflectionGenerator';
import { ReframingService } from './ai/reframingService';
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
        const emotion = this.emotionDetector.parseEmotionFromAI(analysisData.emotion);
        
        // Parse cognitive distortions with enhanced validation
        const distortions = this.distortionDetector.parseDistortionsFromAI(analysisData.cognitive_distortions || [], originalText);
        
        // Parse activities with validation
        const activities = this.activityGenerator.parseActivitiesFromAI(analysisData.suggested_activities || []);
        
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
      return this.parseTextualAIResponse(originalText, aiResponse);
    }
  }

  private parseTextualAIResponse(originalText: string, aiResponse: string): AIAnalysisResult {
    console.log('Using enhanced textual parsing fallback');
    
    // Extract emotion from AI response text
    const emotion = this.emotionDetector.detectEmotion(originalText, aiResponse);
    
    // Extract distortions mentioned in AI response with better detection
    const distortions = this.distortionDetector.detectCognitiveDistortions(originalText);
    
    // Generate activities based on AI insights and emotion
    const activities = this.activityGenerator.generateContextualActivities(originalText, emotion.emotion, aiResponse);
    
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

  private getContentBasedAnalysis(entryText: string): AIAnalysisResult {
    console.log('Using enhanced content-based analysis');
    
    const emotion = this.emotionDetector.detectEmotion(entryText, '');
    const distortions = this.distortionDetector.detectCognitiveDistortions(entryText);
    const activities = this.activityGenerator.generateContextualActivities(entryText, emotion.emotion);
    const reflection = this.reflectionGenerator.generateContentBasedReflection(entryText, emotion.emotion);

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