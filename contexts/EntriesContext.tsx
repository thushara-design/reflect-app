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
      date: 'Tue Jun 24 4:08PM',
      preview: 'I tried speaking up in today\'s team meeting, but I stumbled over my words. My heart was racing.',
      mood: 'neutral',
      title: 'Team Meeting Anxiety',
      content: 'I tried speaking up in today\'s team meeting, but I stumbled over my words. My heart was racing. It\'s frustrating when I have good ideas but can\'t express them clearly.',
      createdAt: new Date('2024-06-24T16:08:00'),
    },
    {
      id: 2,
      date: 'Tue Jun 24 4:08PM',
      preview: 'I tried speaking up in today\'s team meeting, but I stumbled over my words. My heart was racing. Everyone looked so confident, and I felt like I didn\'t belong. Sometimes I wonder if I\'ll ever feel comfortable in these situations.',
      mood: 'neutral',
      title: 'Feeling Out of Place',
      content: 'I tried speaking up in today\'s team meeting, but I stumbled over my words. My heart was racing. Everyone looked so confident, and I felt like I didn\'t belong. Sometimes I wonder if I\'ll ever feel comfortable in these situations. Maybe I need to practice speaking up in smaller groups first.',
      createdAt: new Date('2024-06-24T16:08:00'),
    },
    {
      id: 3,
      date: 'Mon Jun 23 7:20PM',
      preview: 'Reflecting on this week\'s progress. I\'ve been more consistent with my morning routine and it\'s making a difference.',
      mood: 'positive',
      title: 'Weekly Reflection',
      content: 'Reflecting on this week\'s progress. I\'ve been more consistent with my morning routine and it\'s making a difference. Waking up 30 minutes earlier to meditate and journal has set a positive tone for my days.',
      createdAt: new Date('2024-06-23T19:20:00'),
    },
    {
      id: 4,
      date: 'Sun Jun 22 6:15PM',
      preview: 'Spent the afternoon reading in the park. Sometimes the simplest activities bring the most peace and clarity to my mind. The sun was warm and I felt completely present.',
      mood: 'positive',
      title: 'Peaceful Afternoon',
      content: 'Spent the afternoon reading in the park. Sometimes the simplest activities bring the most peace and clarity to my mind. The sun was warm and I felt completely present. I finished two chapters of my book and felt genuinely content.',
      createdAt: new Date('2024-06-22T18:15:00'),
    },
    {
      id: 5,
      date: 'Sat Jun 21 9:30AM',
      preview: 'Had coffee with Sarah this morning. It\'s amazing how a good conversation can shift your entire perspective on things.',
      mood: 'positive',
      title: 'Coffee with Sarah',
      content: 'Had coffee with Sarah this morning. It\'s amazing how a good conversation can shift your entire perspective on things. She helped me see my work situation from a different angle, and I feel more optimistic about the challenges ahead.',
      createdAt: new Date('2024-06-21T09:30:00'),
    },
    {
      id: 6,
      date: 'Fri Jun 20 11:45PM',
      preview: 'Feeling overwhelmed with work deadlines. Need to remember to take breaks and not be so hard on myself. Tomorrow is a new day.',
      mood: 'stressed',
      title: 'Work Overwhelm',
      content: 'Feeling overwhelmed with work deadlines. Need to remember to take breaks and not be so hard on myself. Tomorrow is a new day. I\'ve been pushing too hard lately and need to find better balance.',
      createdAt: new Date('2024-06-20T23:45:00'),
    },
    {
      id: 7,
      date: 'Thu Jun 19 3:15PM',
      preview: 'Meditation session went well today. 10 minutes of breathing exercises.',
      mood: 'calm',
      title: 'Meditation Practice',
      content: 'Meditation session went well today. 10 minutes of breathing exercises helped center me after a hectic morning. I\'m getting better at noticing when my mind wanders and gently bringing attention back to my breath.',
      createdAt: new Date('2024-06-19T15:15:00'),
    },
    {
      id: 8,
      date: 'Wed Jun 18 8:30PM',
      preview: 'Watched the sunset from my balcony. The colors were incredible - deep oranges and purples painting the sky. Made me think about how beauty exists in everyday moments if we just pause to notice.',
      mood: 'peaceful',
      title: 'Sunset Reflection',
      content: 'Watched the sunset from my balcony. The colors were incredible - deep oranges and purples painting the sky. Made me think about how beauty exists in everyday moments if we just pause to notice. These quiet moments of appreciation feel like small gifts.',
      createdAt: new Date('2024-06-18T20:30:00'),
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