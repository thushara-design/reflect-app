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

export interface EmotionIndicator {
  keywords: string[];
  contextPhrases: string[];
  emoji: string;
}

export interface EmotionIndicators {
  [key: string]: EmotionIndicator;
}