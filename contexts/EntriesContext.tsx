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
      id: 9,
      date: 'Fri Jun 27 10:42AM',
      preview: '#Sample My brain feels scattered.',
      mood: 'overwhelmed',
      title: 'Brain Fog Morning',
      content: "Woke up late and couldn't follow through with my morning plan. My brain feels scattered, like tabs open everywhere but nothing loading. I kept pacing without doing anything. I remembered one of the activities I saved — the 5-4-3-2-1 grounding — and that helped a bit. Still, I wish it wasn't always this hard just to start.",
      createdAt: new Date('2024-06-27T10:42:00'),
    },
    {
      id: 10,
      date: 'Thu Jun 26 8:20PM',
      preview: '#Sample Noise today was unbearable.',
      mood: 'anxious',
      title: 'Sensory Overload at the Café',
      content: "Noise today was unbearable. The café was too loud, the music too chaotic, and I could feel my skin buzzing. I had to leave mid-conversation. I used my own strategy from earlier — stepping outside, counting backward from 50, and sipping cold water slowly. It worked. I need to remember this next time I try social plans.",
      createdAt: new Date('2024-06-26T20:20:00'),
    },
    {
      id: 11,
      date: 'Wed Jun 25 3:05PM',
      preview: '#Sample I actually finished something today.',
      mood: 'accomplished',
      title: 'Tiny Win',
      content: "I actually finished something today. I cleaned my desk and replied to one email I had been avoiding for weeks. It's not huge, but it felt good. I remembered one of my saved affirmations: *'One task done is still progress'*. That reminder helped me stop spiraling into guilt.",
      createdAt: new Date('2024-06-25T15:05:00'),
    },
    {
      id: 12,
      date: 'Tue Jun 24 9:40PM',
      preview: '#Sample I shut down mid-task again.',
      mood: 'frustrated',
      title: 'Shutdown Episode',
      content: "I shut down mid-task again. Everything suddenly felt too much — the lights, the to-dos, even my own thoughts. I sat on the floor for an hour. When I finally opened the app and saw the breathing exercise I saved last month, I did it twice. It didn't fix everything, but it helped me move to the next step: brushing my teeth.",
      createdAt: new Date('2024-06-24T21:40:00'),
    }
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