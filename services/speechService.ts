import { Platform } from 'react-native';
import { Audio } from 'expo-av';

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
  private recording: Audio.Recording | null = null;
  private isListening = false;
  private onResultCallback: ((transcript: string, isFinal: boolean, resultIndex: number) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private recordingTimeout: NodeJS.Timeout | null = null;
  private resultIndex = 0;

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

  private async setupAudioMode(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Failed to setup audio mode:', error);
      throw new Error('Failed to setup audio permissions');
    }
  }

  private async startMobileRecording(): Promise<boolean> {
    try {
      await this.setupAudioMode();

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();

      this.isListening = true;

      // Simulate speech recognition with periodic updates
      this.simulateSpeechRecognition();

      return true;
    } catch (error) {
      console.error('Failed to start mobile recording:', error);
      this.onErrorCallback?.('Failed to start voice recording. Please check microphone permissions.');
      return false;
    }
  }

  private simulateSpeechRecognition(): void {
    // For mobile, we'll simulate speech recognition by providing helpful prompts
    // In a real implementation, you would integrate with a speech-to-text service
    
    let interimCount = 0;
    const maxInterimUpdates = 10;
    
    const updateInterval = setInterval(() => {
      if (!this.isListening || interimCount >= maxInterimUpdates) {
        clearInterval(updateInterval);
        return;
      }

      // Simulate interim results
      if (interimCount < 3) {
        this.onResultCallback?.('Listening...', false, this.resultIndex);
      } else if (interimCount < 6) {
        this.onResultCallback?.('Processing your voice...', false, this.resultIndex);
      } else {
        this.onResultCallback?.('Tap stop when finished speaking', false, this.resultIndex);
      }

      interimCount++;
    }, 1000);

    // Auto-stop after 30 seconds
    this.recordingTimeout = setTimeout(() => {
      this.stopMobileRecording();
    }, 30000);
  }

  private async stopMobileRecording(): Promise<void> {
    try {
      if (this.recordingTimeout) {
        clearTimeout(this.recordingTimeout);
        this.recordingTimeout = null;
      }

      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        
        // In a real implementation, you would send the audio file to a speech-to-text service
        // For now, we'll provide a placeholder response
        const placeholderText = "Voice recording completed. In a production app, this would be transcribed to text.";
        
        this.onResultCallback?.(this.formatTranscript(placeholderText), true, this.resultIndex++);
        
        this.recording = null;
      }

      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop mobile recording:', error);
      this.onErrorCallback?.('Failed to stop voice recording');
    }
  }

  isSupported(): boolean {
    if (Platform.OS === 'web') {
      return this.recognition !== null;
    }
    // Mobile platforms support audio recording
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean, resultIndex: number) => void,
    onError: (error: string) => void
  ): boolean {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    if (this.isListening) {
      return false;
    }

    if (Platform.OS === 'web') {
      return this.startWebRecognition();
    } else {
      // Mobile platforms
      this.startMobileRecording();
      return true;
    }
  }

  private startWebRecognition(): boolean {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition not supported in this browser');
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
        this.onResultCallback?.(transcript, isFinal, lastResultIndex);
      }
    };

    this.recognition.onerror = (event) => {
      this.onErrorCallback?.(event.error || 'Speech recognition error');
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
      this.onErrorCallback?.('Failed to start speech recognition');
      return false;
    }
  }

  stopListening(): void {
    if (Platform.OS === 'web') {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      }
    } else {
      // Mobile platforms
      this.stopMobileRecording();
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // Helper method to get platform-specific instructions
  getInstructions(): string {
    if (Platform.OS === 'web') {
      return 'Click the microphone to start voice recognition. Say "period", "comma", etc. for punctuation.';
    } else {
      return 'Tap the microphone to start recording. Tap stop when finished speaking.';
    }
  }

  // Helper method to check if real-time transcription is available
  hasRealTimeTranscription(): boolean {
    return Platform.OS === 'web' && this.recognition !== null;
  }
}

export const speechService = new SpeechService();