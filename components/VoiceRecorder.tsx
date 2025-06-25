import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react-native';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export default function VoiceRecorder({ 
  onTranscript, 
  onError, 
  isRecording, 
  onRecordingChange 
}: VoiceRecorderProps) {
  const [isSupported] = useState(Platform.OS === 'web');

  const handleToggleRecording = () => {
    if (!isSupported) {
      Alert.alert(
        'Voice Recording',
        'Voice recording is only available in the full app. Please create a development build to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isRecording) {
      onRecordingChange(false);
      // Simulate transcript for demo
      onTranscript("This is a demo transcript. Voice recording works in the full app.");
    } else {
      onRecordingChange(true);
      // Auto-stop after 3 seconds for demo
      setTimeout(() => {
        onRecordingChange(false);
        onTranscript("Demo voice input completed.");
      }, 3000);
    }
  };

  const getButtonStyle = () => {
    if (!isSupported) {
      return [styles.recordButton, styles.disabledButton];
    }
    
    if (isRecording) {
      return [styles.recordButton, styles.recordingActive];
    }
    
    return [styles.recordButton];
  };

  const getButtonIcon = () => {
    if (!isSupported) {
      return <Mic size={20} color="#EAEAEA" strokeWidth={1.5} />;
    }

    if (isRecording) {
      return <MicOff size={20} color="#FAFAFA" strokeWidth={1.5} />;
    }

    return <Mic size={20} color="#A5B8C8" strokeWidth={1.5} />;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={getButtonStyle()}
        onPress={handleToggleRecording}
      >
        {getButtonIcon()}
      </TouchableOpacity>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>Recording... (Demo)</Text>
        </View>
      )}

      {!isSupported && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Voice recording requires development build
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingActive: {
    backgroundColor: '#EFCFD6',
    borderColor: '#EFCFD6',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#EAEAEA',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#A5B8C8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recordingText: {
    fontSize: 12,
    color: '#FAFAFA',
    fontWeight: '400',
  },
  helpContainer: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    maxWidth: 200,
  },
  helpText: {
    fontSize: 10,
    color: '#A5B8C8',
    textAlign: 'center',
    lineHeight: 14,
  },
});