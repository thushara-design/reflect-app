export class ReflectionGenerator {
  generateContentBasedReflection(entryText: string, emotion: string): string {
    // Extract key themes and content from the entry
    const sentences = entryText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const lowerText = entryText.toLowerCase();
    
    // Identify key subjects/themes in the entry
    const subjects = this.extractMainSubjects(entryText);
    const mainSubject = subjects[0] || 'this situation';
    
    return this.generateSpecificReflection(emotion, mainSubject, entryText);
  }

  private generateSpecificReflection(emotion: string, subject: string, content: string): string {
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
}