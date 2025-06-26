import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import VoiceRecorder from './VoiceRecorder';

interface EntryActionsProps {
  onSavePress?: () => void;
  isRecording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  onVoiceTranscript?: (text: string) => void;
  onVoiceError?: (error: string) => void;
}

export default function EntryActions({ 
  onSavePress, 
  isRecording = false,
  onRecordingChange,
  onVoiceTranscript,
  onVoiceError
}: EntryActionsProps) {
  return (
    <View style={styles.actionsContainer}>
      {onVoiceTranscript && onVoiceError && onRecordingChange && (
        <VoiceRecorder
          onTranscript={onVoiceTranscript}
          onError={onVoiceError}
          isRecording={isRecording}
          onRecordingChange={onRecordingChange}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.saveButton]}
        onPress={onSavePress}
      >
        <Check size={20} color="#FAFAFA" strokeWidth={1.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#A5B8C8',
    borderColor: '#A5B8C8',
  },
});