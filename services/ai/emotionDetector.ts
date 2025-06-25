import { EmotionResult, EmotionIndicators } from './types';

export class EmotionDetector {
  private emotionIndicators: EmotionIndicators = {
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
      keywords: ['angry', 'frustrated', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged'],
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

  detectEmotion(text: string, aiResponse: string = ''): EmotionResult {
    const fullText = (text + ' ' + aiResponse).toLowerCase();
    
    let maxScore = 0;
    let detectedEmotion = 'neutral';
    let confidence = 0.6;
    
    for (const [emotion, indicators] of Object.entries(this.emotionIndicators)) {
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

    const emoji = this.emotionIndicators[detectedEmotion]?.emoji || '😐';

    return {
      emotion: detectedEmotion,
      emoji,
      confidence
    };
  }

  parseEmotionFromAI(emotionData: any): EmotionResult {
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

    const emotion = emotionData?.primary_emotion || 'neutral';
    let confidence = emotionData?.confidence || 0.7;
    
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
}