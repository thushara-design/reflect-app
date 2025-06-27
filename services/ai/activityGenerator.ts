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
    ],
    distress: [
      {
        id: 'ground-breathing',
        title: 'Box Breathing',
        description: 'Breathe in for 4, hold for 4, out for 4, hold for 4. This can help calm your nervous system when feeling distressed.',
        duration: '3-5 minutes',
        category: 'breathing'
      },
      {
        id: '54321-senses',
        title: 'Name 5 Things You See',
        description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings you back to the present moment.',
        duration: '5 minutes',
        category: 'grounding'
      },
      {
        id: 'crisis-support-link',
        title: 'Talk to Someone',
        description: 'Reach out to a trusted person or helpline. You don\'t have to go through this alone.',
        duration: '10+ minutes',
        category: 'connection'
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
    console.log('=== Activity Generation Debug ===');
    console.log('Emotion detected:', emotion);
    console.log('User toolkit received:', userToolkit);
    console.log('AI enabled:', useAI);
    
    const lowerText = entryText.toLowerCase();
    const lowerAI = aiInsights.toLowerCase();
    
    // STEP 1: Get user's saved activities for this emotion (highest priority)
    const userActivities = this.getUserActivitiesForEmotion(emotion, userToolkit);
    console.log('User activities found:', userActivities.length);
    
    // STEP 2: Get base/predefined activities for this emotion
    let baseActivities = this.getBaseActivitiesForEmotion(emotion);
    console.log('Base activities found:', baseActivities.length);
    
    // STEP 3: Add contextual activities based on entry content
    const contextualActivities = this.getContextualActivities(lowerText, lowerAI);
    console.log('Contextual activities found:', contextualActivities.length);
    
    // STEP 4: Combine all activities with proper prioritization
    // User activities first (personal), then contextual, then base activities
    const allActivities = [
      ...userActivities,
      ...contextualActivities,
      ...baseActivities
    ];
    
    // STEP 5: Remove duplicates and limit total
    const uniqueActivities = this.removeDuplicateActivities(allActivities);
    const finalActivities = uniqueActivities.slice(0, 6);
    
    console.log('Final activities count:', finalActivities.length);
    console.log('Final activities:', finalActivities.map(a => `${a.title} (${a.category})`));
    console.log('=== End Activity Generation Debug ===');
    
    return finalActivities;
  }

  private getUserActivitiesForEmotion(emotion: string, userToolkit: EmotionalToolkitItem[]): ActivitySuggestion[] {
    console.log('Looking for user activities for emotion:', emotion);
    console.log('Available toolkit emotions:', userToolkit.map(item => item.emotion));
    
    // Normalize the input emotion for comparison
    const normalizedEmotion = emotion.toLowerCase().trim();
    
    // Create comprehensive emotion mapping for better matching - same emotions, more natural diary language
    const emotionMappings: Record<string, string[]> = {
      // Anxiety cluster - keeping original emotions, adding natural diary expressions
      'anxiety': ['anxious', 'nervous', 'worried', 'panic', 'fear', 'can\'t sit still', 'racing thoughts', 'what if', 'churning stomach', 'sweaty palms', 'heart racing', 'overthinking', 'spiraling', 'restless', 'jittery', 'on edge', 'butterflies'],
      'anxious': ['anxiety', 'nervous', 'worried', 'panic', 'fear', 'can\'t sit still', 'racing thoughts', 'what if', 'churning stomach', 'sweaty palms', 'heart racing', 'overthinking', 'spiraling', 'restless', 'jittery', 'on edge', 'butterflies'],
      'nervous': ['anxiety', 'anxious', 'worried', 'panic', 'fear', 'can\'t sit still', 'racing thoughts', 'what if', 'churning stomach', 'sweaty palms', 'heart racing', 'overthinking', 'spiraling', 'restless', 'jittery', 'on edge', 'butterflies'],
      'worried': ['anxiety', 'anxious', 'nervous', 'panic', 'fear', 'can\'t sit still', 'racing thoughts', 'what if', 'churning stomach', 'sweaty palms', 'heart racing', 'overthinking', 'spiraling', 'restless', 'jittery', 'on edge', 'butterflies'],
      'panic': ['anxiety', 'anxious', 'nervous', 'worried', 'fear', 'can\'t sit still', 'racing thoughts', 'what if', 'churning stomach', 'sweaty palms', 'heart racing', 'overthinking', 'spiraling', 'restless', 'jittery', 'on edge', 'butterflies'],
      'fear': ['anxiety', 'anxious', 'nervous', 'worried', 'panic', 'can\'t sit still', 'racing thoughts', 'what if', 'churning stomach', 'sweaty palms', 'heart racing', 'overthinking', 'spiraling', 'restless', 'jittery', 'on edge', 'butterflies'],

      // Sadness cluster - keeping original emotions, adding physical/behavioral descriptions
      'sadness': ['sad', 'down', 'depressed', 'blue', 'melancholy', 'heavy', 'tired', 'no energy', 'don\'t want to get up', 'everything feels hard', 'crying', 'tears', 'low', 'drained', 'weighed down', 'dark cloud', 'can\'t enjoy anything'],
      'sad': ['sadness', 'down', 'depressed', 'blue', 'melancholy', 'heavy', 'tired', 'no energy', 'don\'t want to get up', 'everything feels hard', 'crying', 'tears', 'low', 'drained', 'weighed down', 'dark cloud', 'can\'t enjoy anything'],
      'down': ['sadness', 'sad', 'depressed', 'blue', 'melancholy', 'heavy', 'tired', 'no energy', 'don\'t want to get up', 'everything feels hard', 'crying', 'tears', 'low', 'drained', 'weighed down', 'dark cloud', 'can\'t enjoy anything'],
      'depressed': ['sadness', 'sad', 'down', 'blue', 'melancholy', 'heavy', 'tired', 'no energy', 'don\'t want to get up', 'everything feels hard', 'crying', 'tears', 'low', 'drained', 'weighed down', 'dark cloud', 'can\'t enjoy anything'],
      'blue': ['sadness', 'sad', 'down', 'depressed', 'melancholy', 'heavy', 'tired', 'no energy', 'don\'t want to get up', 'everything feels hard', 'crying', 'tears', 'low', 'drained', 'weighed down', 'dark cloud', 'can\'t enjoy anything'],
      'melancholy': ['sadness', 'sad', 'down', 'depressed', 'blue', 'heavy', 'tired', 'no energy', 'don\'t want to get up', 'everything feels hard', 'crying', 'tears', 'low', 'drained', 'weighed down', 'dark cloud', 'can\'t enjoy anything'],

      // Anger cluster - keeping original emotions, adding physical sensations and expressions
      'anger': ['angry', 'mad', 'furious', 'rage', 'irritated', 'hot', 'boiling', 'seeing red', 'clenched jaw', 'tight fists', 'want to scream', 'want to hit something', 'burning up', 'face feels hot', 'gritting teeth'],
      'angry': ['anger', 'mad', 'furious', 'rage', 'irritated', 'hot', 'boiling', 'seeing red', 'clenched jaw', 'tight fists', 'want to scream', 'want to hit something', 'burning up', 'face feels hot', 'gritting teeth'],
      'mad': ['anger', 'angry', 'furious', 'rage', 'irritated', 'hot', 'boiling', 'seeing red', 'clenched jaw', 'tight fists', 'want to scream', 'want to hit something', 'burning up', 'face feels hot', 'gritting teeth'],
      'furious': ['anger', 'angry', 'mad', 'rage', 'irritated', 'hot', 'boiling', 'seeing red', 'clenched jaw', 'tight fists', 'want to scream', 'want to hit something', 'burning up', 'face feels hot', 'gritting teeth'],
      'rage': ['anger', 'angry', 'mad', 'furious', 'irritated', 'hot', 'boiling', 'seeing red', 'clenched jaw', 'tight fists', 'want to scream', 'want to hit something', 'burning up', 'face feels hot', 'gritting teeth'],
      'irritated': ['anger', 'angry', 'mad', 'furious', 'rage', 'hot', 'boiling', 'seeing red', 'clenched jaw', 'tight fists', 'want to scream', 'want to hit something', 'burning up', 'face feels hot', 'gritting teeth'],

      // Stress cluster - keeping original emotions, adding overwhelm descriptions
      'stress': ['stressed', 'overwhelmed', 'pressure', 'tension', 'too much', 'can\'t handle this', 'everything at once', 'tight chest', 'shallow breathing', 'headache', 'shoulders tense', 'brain fog', 'scattered'],
      'stressed': ['stress', 'overwhelmed', 'pressure', 'tension', 'too much', 'can\'t handle this', 'everything at once', 'tight chest', 'shallow breathing', 'headache', 'shoulders tense', 'brain fog', 'scattered'],
      'overwhelmed': ['stress', 'stressed', 'pressure', 'tension', 'too much', 'can\'t handle this', 'everything at once', 'tight chest', 'shallow breathing', 'headache', 'shoulders tense', 'brain fog', 'scattered'],
      'pressure': ['stress', 'stressed', 'overwhelmed', 'tension', 'too much', 'can\'t handle this', 'everything at once', 'tight chest', 'shallow breathing', 'headache', 'shoulders tense', 'brain fog', 'scattered'],
      'tension': ['stress', 'stressed', 'overwhelmed', 'pressure', 'too much', 'can\'t handle this', 'everything at once', 'tight chest', 'shallow breathing', 'headache', 'shoulders tense', 'brain fog', 'scattered'],

      // Frustration cluster - keeping original emotions, adding behavioral descriptions
      'frustration': ['frustrated', 'annoyed', 'irritated', 'why won\'t this work', 'nothing is going right', 'want to give up', 'banging head against wall', 'this is stupid', 'grr', 'ugh'],
      'frustrated': ['frustration', 'annoyed', 'irritated', 'why won\'t this work', 'nothing is going right', 'want to give up', 'banging head against wall', 'this is stupid', 'grr', 'ugh'],
      'annoyed': ['frustration', 'frustrated', 'irritated', 'why won\'t this work', 'nothing is going right', 'want to give up', 'banging head against wall', 'this is stupid', 'grr', 'ugh'],

      // Guilt cluster - keeping original emotions, adding self-critical thoughts
      'guilt': ['guilty', 'shame', 'regret', 'shouldn\'t have', 'I\'m terrible', 'I messed up', 'feel bad about', 'wish I hadn\'t', 'I\'m the worst', 'everyone hates me', 'I ruined everything'],
      'guilty': ['guilt', 'shame', 'regret', 'shouldn\'t have', 'I\'m terrible', 'I messed up', 'feel bad about', 'wish I hadn\'t', 'I\'m the worst', 'everyone hates me', 'I ruined everything'],
      'shame': ['guilt', 'guilty', 'regret', 'shouldn\'t have', 'I\'m terrible', 'I messed up', 'feel bad about', 'wish I hadn\'t', 'I\'m the worst', 'everyone hates me', 'I ruined everything'],
      'regret': ['guilt', 'guilty', 'shame', 'shouldn\'t have', 'I\'m terrible', 'I messed up', 'feel bad about', 'wish I hadn\'t', 'I\'m the worst', 'everyone hates me', 'I ruined everything'],

      // Loneliness cluster - keeping original emotions, adding social isolation descriptions
      'loneliness': ['lonely', 'isolated', 'alone', 'no one understands', 'no one cares', 'by myself', 'left out', 'nobody called', 'sitting alone', 'no friends', 'everyone else has plans'],
      'lonely': ['loneliness', 'isolated', 'alone', 'no one understands', 'no one cares', 'by myself', 'left out', 'nobody called', 'sitting alone', 'no friends', 'everyone else has plans'],
      'isolated': ['loneliness', 'lonely', 'alone', 'no one understands', 'no one cares', 'by myself', 'left out', 'nobody called', 'sitting alone', 'no friends', 'everyone else has plans'],
      'alone': ['loneliness', 'lonely', 'isolated', 'no one understands', 'no one cares', 'by myself', 'left out', 'nobody called', 'sitting alone', 'no friends', 'everyone else has plans'],

      // Numbness cluster - keeping original emotions, adding disconnection descriptions
      'numbness': ['numb', 'empty', 'disconnected', 'void', 'nothing matters', 'don\'t feel anything', 'going through motions', 'like a robot', 'autopilot', 'hollow inside', 'can\'t cry'],
      'numb': ['numbness', 'empty', 'disconnected', 'void', 'nothing matters', 'don\'t feel anything', 'going through motions', 'like a robot', 'autopilot', 'hollow inside', 'can\'t cry'],
      'empty': ['numbness', 'numb', 'disconnected', 'void', 'nothing matters', 'don\'t feel anything', 'going through motions', 'like a robot', 'autopilot', 'hollow inside', 'can\'t cry'],
      'disconnected': ['numbness', 'numb', 'empty', 'void', 'nothing matters', 'don\'t feel anything', 'going through motions', 'like a robot', 'autopilot', 'hollow inside', 'can\'t cry'],
      'void': ['numbness', 'numb', 'empty', 'disconnected', 'nothing matters', 'don\'t feel anything', 'going through motions', 'like a robot', 'autopilot', 'hollow inside', 'can\'t cry'],

      // Happiness cluster - keeping original emotions, adding positive expressions
      'happy': ['happiness', 'joy', 'excited', 'elated', 'good day', 'smiling', 'laughing', 'things went well', 'feeling good', 'bright', 'light', 'bouncy'],
      'happiness': ['happy', 'joy', 'excited', 'elated', 'good day', 'smiling', 'laughing', 'things went well', 'feeling good', 'bright', 'light', 'bouncy'],
      'joy': ['happy', 'happiness', 'excited', 'elated', 'good day', 'smiling', 'laughing', 'things went well', 'feeling good', 'bright', 'light', 'bouncy'],
      'excited': ['happy', 'happiness', 'joy', 'elated', 'good day', 'smiling', 'laughing', 'things went well', 'feeling good', 'bright', 'light', 'bouncy'],
      'elated': ['happy', 'happiness', 'joy', 'excited', 'good day', 'smiling', 'laughing', 'things went well', 'feeling good', 'bright', 'light', 'bouncy'],

      // Calm cluster - keeping original emotions, adding peaceful descriptions
      'calm': ['peaceful', 'serene', 'tranquil', 'relaxed', 'breathing easy', 'shoulders dropped', 'quiet mind', 'still', 'centered', 'at ease', 'soft'],
      'peaceful': ['calm', 'serene', 'tranquil', 'relaxed', 'breathing easy', 'shoulders dropped', 'quiet mind', 'still', 'centered', 'at ease', 'soft'],
      'serene': ['calm', 'peaceful', 'tranquil', 'relaxed', 'breathing easy', 'shoulders dropped', 'quiet mind', 'still', 'centered', 'at ease', 'soft'],
      'tranquil': ['calm', 'peaceful', 'serene', 'relaxed', 'breathing easy', 'shoulders dropped', 'quiet mind', 'still', 'centered', 'at ease', 'soft'],
      'relaxed': ['calm', 'peaceful', 'serene', 'tranquil', 'breathing easy', 'shoulders dropped', 'quiet mind', 'still', 'centered', 'at ease', 'soft']
    };
    
    // Try exact match first (normalized)
    let toolkitItem = userToolkit.find(
      item => item.emotion.toLowerCase().trim() === normalizedEmotion
    );
    
    console.log('Exact match found:', !!toolkitItem);
    
    // If no exact match, try variations
    if (!toolkitItem) {
      const variations = emotionMappings[normalizedEmotion] || [];
      console.log('Trying variations:', variations);
      
      for (const variation of variations) {
        toolkitItem = userToolkit.find(
          item => item.emotion.toLowerCase().trim() === variation.toLowerCase().trim()
        );
        if (toolkitItem) {
          console.log(`Found match using variation: ${variation} -> ${toolkitItem.emotion}`);
          break;
        }
      }
      
      // Also try reverse mapping (check if any toolkit emotion maps to our detected emotion)
      if (!toolkitItem) {
        for (const item of userToolkit) {
          const itemEmotion = item.emotion.toLowerCase().trim();
          const possibleMatches = emotionMappings[itemEmotion] || [];
          if (possibleMatches.includes(normalizedEmotion)) {
            toolkitItem = item;
            console.log(`Found reverse match: ${emotion} matches toolkit item ${item.emotion}`);
            break;
          }
        }
      }
    }

    if (!toolkitItem || !toolkitItem.actions || toolkitItem.actions.length === 0) {
      console.log('No user activities found for emotion:', emotion);
      return [];
    }

    console.log(`Found ${toolkitItem.actions.length} user activities for ${emotion}:`, toolkitItem.actions);

    // Convert user's saved actions to ActivitySuggestion format
    return toolkitItem.actions.map((action, index) => ({
      id: `user-${toolkitItem!.emotion}-${index}`,
      title: action.trim(),
      description: `Your personal coping strategy for ${toolkitItem!.emotion}`,
      duration: '5-10 minutes',
      category: 'personal'
    }));
  }

  private getBaseActivitiesForEmotion(emotion: string): ActivitySuggestion[] {
    const normalizedEmotion = emotion.toLowerCase().trim();
    
    // Try exact match first
    let activities = this.baseActivities[normalizedEmotion];
    
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
        'numbness': 'numbness',
        'happiness': 'happy'
      };
      
      const mappedEmotion = emotionMappings[normalizedEmotion];
      if (mappedEmotion) {
        activities = this.baseActivities[mappedEmotion];
      }
    }
    
    // Fallback to anxious activities if nothing found
    return activities ? [...activities] : [...this.baseActivities['anxious']];
  }

  private getContextualActivities(lowerText: string, lowerAI: string): ActivitySuggestion[] {
    const contextualActivities: ActivitySuggestion[] = [];
    
    // Add contextual activities based on content and AI insights
    if (lowerText.includes('work') || lowerText.includes('job') || lowerAI.includes('work')) {
      contextualActivities.push({
        id: 'work-boundary',
        title: 'Work Boundary Setting',
        description: 'Take 5 minutes to step away from work thoughts and do something just for you.',
        duration: '5 minutes',
        category: 'boundaries'
      });
    }
    
    if (lowerText.includes('relationship') || lowerText.includes('friend') || lowerAI.includes('social')) {
      contextualActivities.push({
        id: 'connection-reach',
        title: 'Reach Out',
        description: 'Consider connecting with someone who makes you feel supported and understood.',
        duration: '10-20 minutes',
        category: 'connection'
      });
    }

    if (lowerText.includes('sleep') || lowerText.includes('tired') || lowerAI.includes('rest')) {
      contextualActivities.push({
        id: 'rest-ritual',
        title: 'Rest Preparation',
        description: 'Create a calming environment and prepare your mind and body for quality rest.',
        duration: '15 minutes',
        category: 'rest'
      });
    }

    if (lowerText.includes('meeting') || lowerText.includes('presentation') || lowerText.includes('speaking')) {
      contextualActivities.push({
        id: 'confidence-building',
        title: 'Confidence Building',
        description: 'Practice positive self-talk and remind yourself of past successes in similar situations.',
        duration: '10 minutes',
        category: 'confidence'
      });
    }

    return contextualActivities;
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