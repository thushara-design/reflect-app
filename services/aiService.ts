import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Edit3, Save, X } from 'lucide-react';
import { freeLLMService } from './FreeLLMService';

// Main Journal Entry Component
export const JournalEntry: React.FC = () => {
  const [entryText, setEntryText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [entryEmoji, setEntryEmoji] = useState('📝');
  const [reframedThoughts, setReframedThoughts] = useState<string[]>([]);
  const [showReframingFor, setShowReframingFor] = useState<number | null>(null);
  const [reframeText, setReframeText] = useState('');

  // 1. VOICE RECORDING FUNCTIONALITY
  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording
      freeLLMService.stopVoiceCapture();
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
      try {
        const transcription = await freeLLMService.startVoiceCapture();
        setEntryText(prev => prev + ' ' + transcription.transcript);
        setIsRecording(false);
      } catch (error) {
        console.error('Voice recording failed:', error);
        setIsRecording(false);
        alert('Voice recording not supported in this browser. Please type your entry.');
      }
    }
  };

  // 2. AI ANALYSIS FUNCTIONALITY
  const handleAnalyze = async () => {
    if (!entryText.trim()) {
      alert('Please write something first!');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Get user preferences from localStorage (set during onboarding)
      const userPreferences = JSON.parse(localStorage.getItem('emotionPreferences') || '[]');
      
      const result = await freeLLMService.analyzeEntry(entryText, userPreferences);
      setAnalysis(result);
      setEntryEmoji(result.suggestedEmoji);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. REFRAMING FUNCTIONALITY
  const handleStartReframing = (distortionIndex: number) => {
    setShowReframingFor(distortionIndex);
    setReframeText('');
  };

  const handleSaveReframe = async (distortionIndex: number) => {
    if (!reframeText.trim()) return;

    const distortion = analysis.distortions[distortionIndex];
    
    // Get AI-suggested reframe
    try {
      const aiReframe = await freeLLMService.generateReframedThought(reframeText, distortion.type);
      
      // Add to reframed thoughts
      const newReframe = `${reframeText} → ${aiReframe}`;
      setReframedThoughts(prev => [...prev, newReframe]);
      
      // Add to entry text with highlighting
      setEntryText(prev => prev + `\n\n[REFRAMED THOUGHT]: ${newReframe}`);
      
      setShowReframingFor(null);
      setReframeText('');
    } catch (error) {
      console.error('Reframing failed:', error);
      // Still save user's own reframe
      setReframedThoughts(prev => [...prev, reframeText]);
      setShowReframingFor(null);
    }
  };

  return (
    <div className="journal-entry max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header with Emoji */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-3xl">{entryEmoji}</span>
          Today's Reflection
        </h1>
        <div className="flex gap-2">
          {/* Voice Recording Button */}
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          {/* AI Analysis Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !entryText.trim()}
            className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Analyze with AI"
          >
            <Sparkles size={20} className={isAnalyzing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Voice Recording Status */}
      {isRecording && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">🎤 Recording... Speak now and your words will be added to your entry.</p>
        </div>
      )}

      {/* Main Text Area */}
      <div className="mb-6">
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="What's on your mind today? You can type here or use the microphone to speak..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          style={{ fontFamily: 'Georgia, serif', lineHeight: '1.6' }}
        />
        <p className="text-sm text-gray-500 mt-2">
          {entryText.length} characters • {isRecording ? 'Recording...' : 'Ready to write'}
        </p>
      </div>

      {/* AI Analysis Results */}
      {analysis && (
        <div className="space-y-6 mt-8">
          {/* Emotional Analysis */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Emotional Tone Detected</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{analysis.emotion.emoji}</span>
              <span className="text-blue-700 capitalize">{analysis.emotion.emotion}</span>
              <span className="text-sm text-blue-600">({Math.round(analysis.emotion.confidence * 100)}% confidence)</span>
            </div>
          </div>

          {/* Cognitive Distortions */}
          {analysis.distortions.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-3">Thinking Patterns to Explore</h3>
              {analysis.distortions.map((distortion: any, index: number) => (
                <div key={index} className="mb-4 p-3 bg-white rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-yellow-700">{distortion.type}</h4>
                    <button
                      onClick={() => handleStartReframing(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Edit3 size={14} />
                      Reframe
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{distortion.description}</p>
                  
                  {distortion.detectedText.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Detected words:</p>
                      <div className="flex flex-wrap gap-1">
                        {distortion.detectedText.map((text: string, i: number) => (
                          <span key={i} className="bg-yellow-200 px-2 py-1 rounded text-xs">
                            "{text}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {distortion.evidence.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Consider these facts:</p>
                      <ul className="text-sm text-gray-600">
                        {distortion.evidence.map((fact: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-500 mt-1">✓</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Reframing Interface */}
                  {showReframingFor === index && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-700 mb-2">{distortion.reframingPrompt}</p>
                      <textarea
                        value={reframeText}
                        onChange={(e) => setReframeText(e.target.value)}
                        placeholder="Write a more balanced version of this thought..."
                        className="w-full p-2 border rounded text-sm h-20"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setShowReframingFor(null)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveReframe(index)}
                          disabled={!reframeText.trim()}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          Save Reframe
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suggested Activities */}
          {analysis.activities.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Suggested Activities</h3>
              <div className="grid gap-3">
                {analysis.activities.map((activity: any) => (
                  <div key={activity.id} className="bg-white p-3 rounded border flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-green-700">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <span className="text-xs text-green-600">{activity.duration} • {activity.category}</span>
                    </div>
                    <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                      Try It
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reframed Thoughts */}
          {reframedThoughts.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">Your Reframed Thoughts</h3>
              {reframedThoughts.map((thought, index) => (
                <div key={index} className="bg-white p-3 rounded border mb-2">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{thought}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Analyzing your entry...</p>
        </div>
      )}
    </div>
  );
};

// Onboarding Component for Emotion/Activity Preferences
export const EmotionPreferencesOnboarding: React.FC<{onComplete: (preferences: any[]) => void}> = ({ onComplete }) => {
  const [selectedPreferences, setSelectedPreferences] = useState<any[]>([]);

  const emotionCategories = [
    { emotion: 'anxious', activities: ['breathing', 'meditation', 'gentle_movement'] },
    { emotion: 'sad', activities: ['gratitude', 'social_connection', 'creative_expression'] },
    { emotion: 'stressed', activities: ['physical_activity', 'nature', 'music'] },
    { emotion: 'angry', activities: ['physical_release', 'journaling', 'progressive_relaxation'] },
    { emotion: 'happy', activities: ['celebration', 'sharing', 'creative_projects'] }
  ];

  const handleTogglePreference = (emotion: string, activity: string) => {
    const key = `${emotion}-${activity}`;
    const exists = selectedPreferences.find(p => p.key === key);
    
    if (exists) {
      setSelectedPreferences(prev => prev.filter(p => p.key !== key));
    } else {
      setSelectedPreferences(prev => [...prev, { key, emotion, activity, category: activity }]);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('emotionPreferences', JSON.stringify(selectedPreferences));
    onComplete(selectedPreferences);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Personalize Your Experience</h2>
      <p className="text-gray-600 mb-6">
        Select activities you'd like suggested when you're feeling different emotions:
      </p>

      <div className="space-y-4">
        {emotionCategories.map(category => (
          <div key={category.emotion} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 capitalize">When I'm {category.emotion}:</h3>
            <div className="flex flex-wrap gap-2">
              {category.activities.map(activity => (
                <button
                  key={activity}
                  onClick={() => handleTogglePreference(category.emotion, activity)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedPreferences.find(p => p.key === `${category.emotion}-${activity}`)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {activity.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleComplete}
        className="w-full mt-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Complete Setup
      </button>
    </div>
  );
};