import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AIAnalysisResult } from '@/services/aiService';

export interface Entry {
  id: number;
  date: string;
  preview: string;
  mood: string;
  title?: string;
  content: string;
  createdAt: Date;
  aiAnalysis?: AIAnalysisResult | null;
}

interface EntriesContextType {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: number, entry: Partial<Entry>) => void;
  deleteEntry: (id: number) => void;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: 1,
      date: 'Today 2:30PM',
      preview: 'Had a breakthrough moment during my morning walk today.',
      mood: 'positive',
      title: '🌅 Morning Walk Clarity',
      content: 'Had a breakthrough moment during my morning walk today. I\'ve been struggling with that work decision for weeks, but something about the fresh air and movement helped everything click into place. Sometimes the best solutions come when we stop forcing them and just let our minds wander. I feel so much lighter now that I know which direction to take.\n\nIt\'s amazing how physical movement can unlock mental clarity. I should remember this for future tough decisions.',
      createdAt: new Date('2024-12-27T14:30:00'),
    },
    {
      id: 2,
      date: 'Yesterday 8:45PM',
      preview: 'Called Mom tonight and we talked for over an hour.',
      mood: 'grateful',
      title: '💝 Heart-to-Heart with Mom',
      content: 'Called Mom tonight and we talked for over an hour. She shared stories about her childhood that I\'d never heard before - like how she used to sneak out to watch the sunrise from the old oak tree behind their house. It made me realize how much I don\'t know about her life before I was born.\n\nThese conversations feel so precious now. I want to make sure I create more space for them. There\'s something healing about really listening to the people we love, not just waiting for our turn to speak.',
      createdAt: new Date('2024-12-26T20:45:00'),
    },
    {
      id: 3,
      date: 'Dec 25 6:15PM',
      preview: 'The holidays always bring up complicated feelings for me.',
      mood: 'reflective',
      title: '🎄 Holiday Complexity',
      content: 'The holidays always bring up complicated feelings for me. Joy mixed with sadness, gratitude alongside loneliness. Today I watched my family laugh together and felt both completely connected and somehow separate at the same time.\n\nI think that\'s okay though. Maybe the complexity is what makes these moments real. I\'m learning to hold space for all of it - the warmth and the ache, the presence and the absence of people who should be here.',
      createdAt: new Date('2024-12-25T18:15:00'),
    },
    {
      id: 4,
      date: 'Dec 24 11:20AM',
      preview: 'Woke up feeling anxious about the presentation tomorrow.',
      mood: 'anxious',
      title: '😰 Pre-Presentation Nerves',
      content: 'Woke up feeling anxious about the presentation tomorrow. My mind keeps running through all the things that could go wrong - forgetting my words, the slides not working, people asking questions I can\'t answer.\n\nBut then I remembered what my therapist said about acknowledging the anxiety without letting it drive the bus. I\'ve prepared well, I know my material, and even if it doesn\'t go perfectly, that\'s human. Taking some deep breaths and reminding myself that this feeling will pass.',
      createdAt: new Date('2024-12-24T11:20:00'),
    },
    {
      id: 5,
      date: 'Dec 23 4:30PM',
      preview: 'Spent the afternoon organizing old photos.',
      mood: 'nostalgic',
      title: '📸 Memory Lane',
      content: 'Spent the afternoon organizing old photos. Found pictures from college that made me laugh until I cried - there\'s one of me and Jake trying to build furniture at 2am, both of us looking completely defeated by an IKEA bookshelf.\n\nIt\'s amazing how a single image can transport you back to exactly how you felt in that moment. I was so worried about everything back then - grades, jobs, the future. But looking at those photos, all I see is joy and possibility. Maybe my current worries will look the same way someday.',
      createdAt: new Date('2024-12-23T16:30:00'),
    },
    {
      id: 6,
      date: 'Dec 22 9:15PM',
      preview: 'Had a difficult conversation with Sarah today.',
      mood: 'processing',
      title: '💬 Honest Conversation',
      content: 'Had a difficult conversation with Sarah today. We\'ve been dancing around this issue for months - the way our friendship has felt strained since she got promoted. It finally came to a head when she asked directly if I was upset with her.\n\nIt was uncomfortable and emotional, but I\'m glad we talked. I admitted I was struggling with jealousy, and she shared how isolated she\'s felt in her new role. Sometimes relationships require us to sit in the discomfort of honesty. I don\'t know where things will go from here, but at least we\'re both being real about what we need.',
      createdAt: new Date('2024-12-22T21:15:00'),
    },
    {
      id: 7,
      date: 'Dec 21 7:00AM',
      preview: 'First day of winter and I actually feel hopeful.',
      mood: 'hopeful',
      title: '❄️ Winter Solstice Hope',
      content: 'First day of winter and I actually feel hopeful. Usually the shorter days get to me - that heavy feeling when it\'s dark by 5pm. But this year feels different. Maybe it\'s because I\'ve been more intentional about taking care of myself.\n\nThe meditation practice, the journaling, the evening walks even when it\'s cold - they\'re all small things but they add up. I\'m learning that hope isn\'t about everything being perfect. It\'s about trusting that I can handle whatever comes, one day at a time.',
      createdAt: new Date('2024-12-21T07:00:00'),
    },
    {
      id: 8,
      date: 'Dec 20 3:45PM',
      preview: 'Therapy session today was intense but helpful.',
      mood: 'processing',
      title: '🧠 Therapy Breakthrough',
      content: 'Therapy session today was intense but helpful. We talked about the patterns I fall into when I\'m stressed - the way I shut down instead of reaching out, how I convince myself that people are better off without my problems.\n\nDr. Martinez helped me see how this actually pushes people away, creating the very isolation I\'m trying to avoid. It\'s hard to see these things about yourself, but there\'s also relief in understanding. She reminded me that awareness is the first step to change. I don\'t have to be perfect, I just have to be willing to notice and try something different.',
      createdAt: new Date('2024-12-20T15:45:00'),
    },
  ]);

  const addEntry = (newEntry: Omit<Entry, 'id' | 'createdAt'>) => {
    const entry: Entry = {
      ...newEntry,
      id: Math.max(...entries.map(e => e.id), 0) + 1,
      createdAt: new Date(),
    };
    setEntries(prev => [entry, ...prev]); // Add to beginning for newest first
  };

  const updateEntry = (id: number, updatedEntry: Partial<Entry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
  };

  const deleteEntry = (id: number) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <EntriesContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
}