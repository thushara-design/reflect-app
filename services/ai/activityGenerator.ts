import { ActivitySuggestion } from './types';
import { EmotionalToolkitItem } from '@/contexts/OnboardingContext';

export class ActivityGenerator {
  private baseActivities: Record<string, ActivitySuggestion[]> = {
    anxiety: [
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
    sadness: [
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
    anger: [
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
    stress: [
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
    frustration: [
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
    guilt: [
      {
        id: 'self-forgiveness',
        title: 'Self-Forgiveness Practice',
        description: 'Acknowledge your mistake, learn from it, and practice self-compassion instead of harsh self-judgment.',
        duration: '10-15 minutes',
        category: 'self-care'
      },
      {
        id: 'values-reflection',
        title: 'Values Reflection',
        description: 'Reflect on your core values and how you can align your future actions with what matters most to you.',
        duration: '15 minutes',
        category: 'reflection'
      }
    ],
    loneliness: [
      {
        id: 'connection-reach',
        title: 'Reach Out',
        description: 'Send a message to someone you care about or join an online community that shares your interests.',
        duration: '10-20 minutes',
        category: 'connection'
      },
      {
        id: 'self-companionship',
        title: 'Self-Companionship',
        description: 'Do something kind for yourself that you would do for a good friend - make tea, listen to music, or read.',
        duration: '15-30 minutes',
        category: 'self-care'
      }
    ],
    lonely: [
      {
        id: 'connection-reach',
        title: 'Reach Out',
        description: 'Send a message to someone you care about or join an online community that shares your interests.',
        duration: '10-20 minutes',
        category: 'connection'
      },
      {
        id: 'self-companionship',
        title: 'Self-Companionship',
        description: 'Do something kind for yourself that you would do for a good friend - make tea, listen to music, or read.',
        duration: '15-30 minutes',
        category: 'self-care'
      }
    ],
    numbness: [
      {
        id: 'sensory-grounding',
        title: 'Sensory Grounding',
        description: 'Engage your senses - hold an ice cube, smell something strong, or listen to music to reconnect with feeling.',
        duration: '5-10 minutes',
        category: 'grounding'
      },
      {
        id: 'gentle-movement',
        title: 'Gentle Movement',
        description: 'Try light stretching or walking to help reconnect with your body and emotions.',
        duration: '10-15 minutes',
        category: 'movement'
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

  generateContextualActivities(
    entryText: string, 
    emotion: string, 
    aiInsights: string = '',
    userToolkit: EmotionalToolkitItem[] = [],
    useAI: boolean = true
  ): ActivitySuggestion[] {
    console.log('Generating activities for emotion:', emotion);
    console.log('User toolkit:', userToolkit);
    
    const lowerText = entryText.toLowerCase();
    const lowerAI = aiInsights.toLowerCase();
    
    // ALWAYS start with user's saved activities for this emotion (highest priority)
    const userActivities = this.getUserActivitiesForEmotion(emotion, userToolkit);
    console.log('Found user activities:', userActivities);
    
    // Get base activities for this emotion (try exact match first, then fallback)
    let baseActivities = this.getBaseActivitiesForEmotion(emotion);
    
    // If AI is disabled, return user activities + basic emotion-based activities
    if (!useAI) {
      const allActivities = [...userActivities, ...baseActivities];
      const uniqueActivities = this.removeDuplicateActivities(allActivities);
      console.log('AI disabled - returning activities:', uniqueActivities);
      return uniqueActivities.slice(0, 6);
    }
    
    // Add contextual activities based on content and AI insights
    if (lowerText.includes('work') || lowerText.includes('job') || lowerAI.includes('work')) {
      baseActivities.push({
        id: 'work-boundary',
        title: 'Work Boundary Setting',
        description: 'Take 5 minutes to step away from work thoughts and do something just for you.',
        duration: '5 minutes',
        category: 'boundaries'
      });
    }
    
    if (lowerText.includes('relationship') || lowerText.includes('friend') || lowerAI.includes('social')) {
      baseActivities.push({
        id: 'connection-reach',
        title: 'Reach Out',
        description: 'Consider connecting with someone who makes you feel supported and understood.',
        duration: '10-20 minutes',
        category: 'connection'
      });
    }

    if (lowerText.includes('sleep') || lowerText.includes('tired') || lowerAI.includes('rest')) {
      baseActivities.push({
        id: 'rest-ritual',
        title: 'Rest Preparation',
        description: 'Create a calming environment and prepare your mind and body for quality rest.',
        duration: '15 minutes',
        category: 'rest'
      });
    }

    // Combine user activities (prioritized) with base/contextual activities
    const allActivities = [...userActivities, ...baseActivities];
    
    // Remove duplicates and limit to 6 total activities
    const uniqueActivities = this.removeDuplicateActivities(allActivities);
    console.log('Final activities:', uniqueActivities);
    return uniqueActivities.slice(0, 6);
  }

  private getUserActivitiesForEmotion(emotion: string, userToolkit: EmotionalToolkitItem[]): ActivitySuggestion[] {
    console.log('Looking for user activities for emotion:', emotion);
    console.log('Available toolkit items:', userToolkit.map(item => item.emotion));
    
    // Try exact match first
    let toolkitItem = userToolkit.find(
      item => item.emotion.toLowerCase() === emotion.toLowerCase()
    );
    
    // If no exact match, try partial matches for common emotion variations
    if (!toolkitItem) {
      const emotionMappings: Record<string, string[]> = {
        'anxiety': ['anxious', 'nervous', 'worried'],
        'anxious': ['anxiety', 'nervous', 'worried'],
        'sadness': ['sad', 'down', 'depressed'],
        'sad': ['sadness', 'down', 'depressed'],
        'anger': ['angry', 'mad', 'furious'],
        'angry': ['anger', 'mad', 'furious'],
        'stress': ['stressed', 'overwhelmed', 'pressure'],
        'stressed': ['stress', 'overwhelmed', 'pressure'],
        'frustration': ['frustrated', 'annoyed'],
        'frustrated': ['frustration', 'annoyed'],
        'guilt': ['guilty', 'shame'],
        'guilty': ['guilt', 'shame'],
        'loneliness': ['lonely', 'isolated'],
        'lonely': ['loneliness', 'isolated'],
        'numbness': ['numb', 'empty', 'disconnected'],
        'numb': ['numbness', 'empty', 'disconnected']
      };
      
      const variations = emotionMappings[emotion.toLowerCase()] || [];
      for (const variation of variations) {
        toolkitItem = userToolkit.find(
          item => item.emotion.toLowerCase() === variation
        );
        if (toolkitItem) {
          console.log(`Found toolkit item for ${emotion} using variation: ${variation}`);
          break;
        }
      }
    }

    if (!toolkitItem || !toolkitItem.actions.length) {
      console.log('No user activities found for emotion:', emotion);
      return [];
    }

    console.log(`Found ${toolkitItem.actions.length} user activities for ${emotion}:`, toolkitItem.actions);

    // Convert user's saved actions to ActivitySuggestion format
    return toolkitItem.actions.map((action, index) => ({
      id: `user-${emotion}-${index}`,
      title: action,
      description: `Your personal coping strategy for ${toolkitItem.emotion}`,
      duration: '5-10 minutes',
      category: 'personal'
    }));
  }

  private getBaseActivitiesForEmotion(emotion: string): ActivitySuggestion[] {
    // Try exact match first
    let activities = this.baseActivities[emotion.toLowerCase()];
    
    // If no exact match, try common variations
    if (!activities) {
      const emotionMappings: Record<string, string> = {
        'anxiety': 'anxious',
        'sadness': 'sad',
        'anger': 'angry',
        'stress': 'stressed',
        'frustration': 'frustrated',
        'guilt': 'guilt',
        'loneliness': 'lonely',
        'numbness': 'numbness'
      };
      
      const mappedEmotion = emotionMappings[emotion.toLowerCase()];
      if (mappedEmotion) {
        activities = this.baseActivities[mappedEmotion];
      }
    }
    
    // Fallback to anxious activities if nothing found
    return activities ? [...activities] : [...this.baseActivities['anxious']];
  }

  private removeDuplicateActivities(activities: ActivitySuggestion[]): ActivitySuggestion[] {
    const seen = new Set<string>();
    return activities.filter(activity => {
      const key = activity.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
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