import { ActivitySuggestion } from './types';

export class ActivityGenerator {
  private baseActivities: Record<string, ActivitySuggestion[]> = {
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

  generateContextualActivities(entryText: string, emotion: string, aiInsights: string = ''): ActivitySuggestion[] {
    const lowerText = entryText.toLowerCase();
    const lowerAI = aiInsights.toLowerCase();
    
    let activities = [...(this.baseActivities[emotion] || this.baseActivities['anxious'])];
    
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

  parseActivitiesFromAI(activitiesData: any[]): ActivitySuggestion[] {
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
}