import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Mic, MicOff, Square } from 'lucide-react-native';
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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const scale = useSharedValue(1);
  const processedResults = useRef(new Set<number>());
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );

      // Start duration counter for mobile
      if (Platform.OS !== 'web') {
        setRecordingDuration(0);
        durationInterval.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      }
    } else {
      // Stop animation and reset
      scale.value = withTiming(1, { duration: 200 });
      setInterimText('');
      setRecordingDuration(0);
      processedResults.current.clear();
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }
  }, [isRecording, scale]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleRecording = () => {
    if (!speechService.isSupported()) {
      const platformMessage = Platform.OS === 'web' 
        ? 'Speech recognition is not supported in this browser. Please try Chrome, Safari, or Edge.'
        : 'Voice recording is not supported on this device.';
      
      onError(platformMessage);
      return;
    }

    if (isRecording) {
      speechService.stopListening();
      onRecordingChange(false);
      setInterimText('');
      setRecordingDuration(0);
      processedResults.current.clear();
    } else {
      // Show platform-specific instructions
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Voice Recording',
          'Tap the microphone to start recording your thoughts. Tap stop when finished.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Start Recording', 
              onPress: () => startRecording()
            }
          ]
        );
      } else {
        startRecording();
      }
    }
  };

  const startRecording = () => {
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
        setRecordingDuration(0);
        processedResults.current.clear();
      }
    );

    if (success) {
      onRecordingChange(true);
      processedResults.current.clear();
    }
  };

  const getButtonStyle = () => {
    if (!speechService.isSupported()) {
      return [styles.recordButton, styles.disabledButton];
    }
    
    if (isRecording) {
      return [styles.recordButton, styles.recordingActive];
    }
    
    return [styles.recordButton];
  };

  const getButtonIcon = () => {
    if (!speechService.isSupported()) {
      return <Mic size={20} color="#EAEAEA" strokeWidth={1.5} />;
    }

    if (isRecording) {
      // Show different icons based on platform
      if (Platform.OS === 'web') {
        return <MicOff size={20} color="#FAFAFA" strokeWidth={1.5} />;
      } else {
        return <Square size={16} color="#FAFAFA" strokeWidth={1.5} />;
      }
    }

    return <Mic size={20} color="#A5B8C8" strokeWidth={1.5} />;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={getButtonStyle()}
        onPress={handleToggleRecording}
        disabled={!speechService.isSupported()}
      >
        <Animated.View style={animatedStyle}>
          {getButtonIcon()}
        </Animated.View>
      </TouchableOpacity>
      
      {/* Recording duration for mobile */}
      {isRecording && Platform.OS !== 'web' && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}
      
      {/* Interim text for web */}
      {interimText && Platform.OS === 'web' && (
        <View style={styles.interimContainer}>
          <Text style={styles.interimText}>{interimText}</Text>
          <Text style={styles.punctuationHint}>
            Say "period", "comma", "question mark" for punctuation
          </Text>
        </View>
      )}

      {/* Mobile instructions */}
      {isRecording && Platform.OS !== 'web' && (
        <View style={styles.mobileInstructionsContainer}>
          <Text style={styles.mobileInstructions}>
            Recording... Tap stop when finished
          </Text>
        </View>
      )}

      {/* Platform-specific help text */}
      {!isRecording && !speechService.isSupported() && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {Platform.OS === 'web' 
              ? 'Voice recognition requires Chrome, Safari, or Edge'
              : 'Voice recording not available on this device'
            }
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
  durationContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFCFD6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  durationText: {
    fontSize: 12,
    color: '#2A2A2A',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  mobileInstructionsContainer: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#A5B8C8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mobileInstructions: {
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