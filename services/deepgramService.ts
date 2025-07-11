import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

const DEEPGRAM_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_KEY;
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen';

if (!DEEPGRAM_KEY) {
  throw new Error('Deepgram API key is not set in environment variables.');
}

// Utility to detect MIME type based on file extension
function getAudioFormat(uri: string): { mimeType: string; extension: string } {
  const lowerUri = uri.toLowerCase();
  if (lowerUri.includes('.wav')) return { mimeType: 'audio/wav', extension: 'wav' };
  if (lowerUri.includes('.mp3')) return { mimeType: 'audio/mpeg', extension: 'mp3' };
  if (lowerUri.includes('.aac')) return { mimeType: 'audio/aac', extension: 'aac' };
  if (lowerUri.includes('.m4a')) return { mimeType: 'audio/mp4', extension: 'm4a' };
  return { mimeType: 'audio/mp4', extension: 'm4a' }; // default
}

async function getAudioDataForWeb(uri: string): Promise<Buffer> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio data: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Failed to read audio data on web: ${error}`);
  }
}

async function getAudioDataForNative(uri: string): Promise<Buffer> {
  try {
    console.log('Checking audio file...');
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists || !fileInfo.size || fileInfo.size < 1000) {
      throw new Error('Invalid or corrupt audio file.');
    }

    console.log('Reading audio as base64...');
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new Error(`Failed to read audio data on native: ${error}`);
  }
}

export async function transcribeAudio(uri: string, mimeOverride?: string): Promise<string> {
  try {
    const audioFormat = getAudioFormat(uri);
    const mimeType = mimeOverride || audioFormat.mimeType;

    let binaryData: Buffer;

    if (Platform.OS === 'web') {
      console.log('Reading audio data for web...');
      binaryData = await getAudioDataForWeb(uri);
    } else {
      console.log('Reading audio data for native...');
      binaryData = await getAudioDataForNative(uri);
    }

    const params = new URLSearchParams({
      punctuate: 'true',
      language: 'en-US',
      model: 'nova-2',
      smart_format: 'true',
    });

    console.log('Sending to Deepgram...');
    const response = await fetch(`${DEEPGRAM_URL}?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_KEY}`,
        'Content-Type': mimeType,
      },
      body: binaryData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram error response:', errText);
      throw new Error(`Deepgram API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    console.log('Transcription successful');
    return transcript.trim();
  } catch (err: any) {
    console.error('Transcription error:', err.message);
    throw new Error(`Transcription failed: ${err.message}`);
  }
}