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
      const reframingPrompt = `As a cognitive behavioral therapist, help gently reframe this unhelpful thought:

ORIGINAL THOUGHT: "${originalThought}"
DISTORTION TYPE: ${distortionType}
USER CONTEXT: "${userContext}"

Provide a gentle, compassionate, and supportive reframe that:
1. Acknowledges the person's feelings with empathy
2. When challenging the distortion or presenting evidence, do so by asking gentle questions (e.g., "Is it possible that...?", "Could there be another way to see this?")
3. Offers a more balanced, realistic perspective
4. Is written in first person ("I" statements)

Respond with ONLY the reframed thought, no additional text:`;

      const response = await axios.post(
        this.apiUrl,
        {
          messages: [
            { 
              role: 'system', 
              content: 'You are a cognitive behavioral therapist helping someone reframe unhelpful thoughts gently. Respond with only the reframed thought, nothing else.' 
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
        'This feels overwhelming right now, but is it possible that things might not turn out as badly as I fear?',
        'I know I am worried, but could there be more than one possible outcome here?',
        'Is it possible that I have handled difficult situations before, and I might be able to handle this too, one step at a time?'
      ],
      'All-or-Nothing Thinking': [
        'I feel like this is all or nothing, but could there be some gray areas I am not seeing?',
        'Is it possible that even small steps forward are still progress?',
        'Could there be aspects of this situation that are both challenging and positive?'
      ],
      'Mind Reading': [
        'I feel like I know what others are thinking, but is it possible I don\'t have all the information?',
        'Could there be other explanations for their behavior that have nothing to do with me?',
        'Is it possible that I am focusing on what I imagine, rather than what I actually know?'
      ],
      'Fortune Telling': [
        'I am worried about what might happen, but is it possible that I can\'t predict the future with certainty?',
        'Could things turn out differently than I expect?',
        'Is it possible that I can focus on what I can control right now, even if I feel uncertain?'
      ],
      'Emotional Reasoning': [
        'I feel strongly about this, but could my feelings be just one part of the picture?',
        'Is it possible that my emotions are valid, but they might not tell the whole story?',
        'Could there be evidence that gently challenges how I\'m feeling right now?'
      ]
    };

    const templates = reframingTemplates[distortionType] || reframingTemplates['Catastrophizing'];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}