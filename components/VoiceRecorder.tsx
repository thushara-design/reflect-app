import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Mic, MicOff } from 'lucide-react-native';
import { speechService } from '@/services/speechService';

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
  const [interimText, setInterimText] = useState('');
  const scale = useSharedValue(1);
  const processedResults = useRef(new Set<number>());

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation using react-native-reanimated
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    } else {
      // Stop animation and reset scale
      scale.value = withTiming(1, { duration: 200 });
      // Clear interim text when stopping
      setInterimText('');
      processedResults.current.clear();
    }
  }, [isRecording, scale]);

  const handleToggleRecording = () => {
    // Check if we're on web platform and speech recognition is supported
    if (Platform.OS !== 'web') {
      onError('Voice recording is only available on web browsers');
      return;
    }

    if (!speechService.isSupported()) {
      onError('Speech recognition is not supported in this browser. Please try Chrome, Safari, or Edge.');
      return;
    }

    if (isRecording) {
      speechService.stopListening();
      onRecordingChange(false);
      setInterimText('');
      processedResults.current.clear();
    } else {
      const success = speechService.startListening(
        (transcript, isFinal, resultIndex) => {
          if (isFinal) {
            // Only process each final result once using the result index
            if (!processedResults.current.has(resultIndex)) {
              processedResults.current.add(resultIndex);
              onTranscript(transcript);
            }
            setInterimText('');
          } else {
            // Show interim results (but don't format them yet)
            setInterimText(transcript);
          }
        },
        (error) => {
          onError(error);
          onRecordingChange(false);
          setInterimText('');
          processedResults.current.clear();
        }
      );

      if (success) {
        onRecordingChange(true);
        processedResults.current.clear();
      }
    }
  };

  // Show different UI based on platform
  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity 
        style={[styles.recordButton, styles.disabledButton]}
        onPress={handleToggleRecording}
      >
        <Mic size={20} color="#EAEAEA" strokeWidth={1.5} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.recordButton, 
          isRecording && styles.recordingActive
        ]}
        onPress={handleToggleRecording}
      >
        <Animated.View style={animatedStyle}>
          {isRecording ? (
            <MicOff size={20} color="#FAFAFA" strokeWidth={1.5} />
          ) : (
            <Mic size={20} color={isRecording ? "#FAFAFA" : "#A5B8C8"} strokeWidth={1.5} />
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {interimText && (
        <View style={styles.interimContainer}>
          <Text style={styles.interimText}>{interimText}</Text>
          <Text style={styles.punctuationHint}>
            Say "period", "comma", "question mark" for punctuation
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
  interimContainer: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    maxWidth: 200,
    zIndex: 1000,
  },
  interimText: {
    fontSize: 12,
    color: '#A5B8C8',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  punctuationHint: {
    fontSize: 10,
    color: '#EAEAEA',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});