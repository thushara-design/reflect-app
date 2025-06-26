import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Mic, Square } from 'lucide-react-native';
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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scale = useSharedValue(1);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
      setRecordingDuration(0);
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      scale.value = withTiming(1, { duration: 200 });
      setRecordingDuration(0);
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
      onError('Voice recording is not supported on this device.');
      return;
    }
    if (isRecording) {
      setIsTranscribing(true);
      speechService.stopListening();
      onRecordingChange(false);
    } else {
      setIsTranscribing(false);
      startRecording();
    }
  };

  const startRecording = () => {
    const success = speechService.startListening(
      (transcript, isFinal) => {
        if (isFinal) {
          setIsTranscribing(false);
          onTranscript(transcript);
        }
      },
      (error) => {
        setIsTranscribing(false);
        onError(error);
        onRecordingChange(false);
      }
    );
    if (success) {
      onRecordingChange(true);
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
    if (isRecording) {
      return <Square size={16} color="#FAFAFA" strokeWidth={1.5} />;
    }
    return <Mic size={20} color={speechService.isSupported() ? '#A5B8C8' : '#EAEAEA'} strokeWidth={1.5} />;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={getButtonStyle()}
        onPress={handleToggleRecording}
        disabled={!speechService.isSupported() || isTranscribing}
      >
        <Animated.View style={animatedStyle}>
          {getButtonIcon()}
        </Animated.View>
      </TouchableOpacity>
      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}
      {isTranscribing && (
        <View style={styles.transcribingContainer}>
          <ActivityIndicator size="small" color="#A5B8C8" />
          <Text style={styles.transcribingText}>Transcribing...</Text>
        </View>
      )}
      {!isRecording && !speechService.isSupported() && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Voice recording not available on this device
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
  transcribingContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    maxWidth: 200,
    zIndex: 1000,
    gap: 8,
  },
  transcribingText: {
    fontSize: 12,
    color: '#A5B8C8',
    fontStyle: 'italic',
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