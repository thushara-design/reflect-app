import { CognitiveDistortion } from './types';

export class DistortionDetector {
  detectCognitiveDistortions(text: string): CognitiveDistortion[] {
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

  parseDistortionsFromAI(distortionsData: any[], originalText: string): CognitiveDistortion[] {
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
}