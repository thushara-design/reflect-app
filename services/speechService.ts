import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio } from './deepgramService';

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

export class SpeechService {
  private recording: Audio.Recording | null = null;
  private isListening = false;
  private onResultCallback: ((transcript: string, isFinal: boolean, resultIndex: number) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private resultIndex = 0;

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

  private async startRecording(): Promise<boolean> {
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
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onErrorCallback?.('Failed to start voice recording. Please check microphone permissions.');
      return false;
    }
  }

  private async stopRecordingAndTranscribe(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        let mimeType = Platform.OS === 'ios' || Platform.OS === 'android' ? 'audio/m4a' : 'audio/webm';
        if (uri) {
          const transcript = await transcribeAudio(uri, mimeType);
          this.onResultCallback?.(transcript, true, this.resultIndex++);
        } else {
          this.onErrorCallback?.('No audio file found after recording.');
        }
        this.recording = null;
      }
      this.isListening = false;
    } catch (error) {
      console.error('Failed to stop recording or transcribe:', error);
      this.onErrorCallback?.('Failed to transcribe audio.');
    }
  }

  isSupported(): boolean {
    // All platforms are supported if permissions are granted
    return Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web';
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
    this.startRecording();
    return true;
  }

  stopListening(): void {
    if (this.isListening) {
      this.stopRecordingAndTranscribe();
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getInstructions(): string {
    return 'Tap the microphone to start recording. Tap stop when finished speaking.';
  }

  hasRealTimeTranscription(): boolean {
    return false; // Deepgram returns only final transcript after upload
  }
}

export const speechService = new SpeechService();