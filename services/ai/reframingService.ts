import axios from 'axios';

export class ReframingService {
  private apiKey: string;
  private apiUrl: string = 'https://api.fireworks.ai/inference/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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
}