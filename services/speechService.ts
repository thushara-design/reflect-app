import { Platform } from 'react-native';

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  private formatTranscript(transcript: string): string {
    // Clean up the transcript and add proper formatting
    let formatted = transcript.trim();
    
    // Capitalize first letter if it's not already
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    
    // Handle common spoken punctuation commands
    formatted = formatted
      // Handle period commands
      .replace(/\s+(period|dot)\s*/gi, '. ')
      .replace(/\s+(comma)\s*/gi, ', ')
      .replace(/\s+(question mark)\s*/gi, '? ')
      .replace(/\s+(exclamation point|exclamation mark)\s*/gi, '! ')
      .replace(/\s+(colon)\s*/gi, ': ')
      .replace(/\s+(semicolon)\s*/gi, '; ')
      
      // Handle new line/paragraph commands
      .replace(/\s+(new line|newline)\s*/gi, '\n')
      .replace(/\s+(new paragraph|paragraph)\s*/gi, '\n\n')
      
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
    
    return formatted;
  }

  isSupported(): boolean {
    return Platform.OS === 'web' && this.recognition !== null;
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean, resultIndex: number) => void,
    onError: (error: string) => void
  ): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Process only the latest result
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      
      if (result && result[0]) {
        let transcript = result[0].transcript;
        const isFinal = result.isFinal;
        
        // Format the transcript if it's final
        if (isFinal) {
          transcript = this.formatTranscript(transcript);
        }
        
        // Pass the result index to help track which results have been processed
        onResult(transcript, isFinal, lastResultIndex);
      }
    };

    this.recognition.onerror = (event) => {
      onError(event.error || 'Speech recognition error');
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      onError('Failed to start speech recognition');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();