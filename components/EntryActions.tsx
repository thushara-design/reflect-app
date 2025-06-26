import { View, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';
import { useState } from 'react';
import { Check, MoveHorizontal as MoreHorizontal, Sparkles } from 'lucide-react-native';
import VoiceRecorder from './VoiceRecorder';

interface EntryActionsProps {
  onSavePress?: () => void;
  onAIAnalysis?: () => void;
  showContextMenu?: boolean;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  isRecording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  onVoiceTranscript?: (text: string) => void;
  onVoiceError?: (error: string) => void;
}

export default function EntryActions({ 
  onSavePress, 
  onAIAnalysis,
  showContextMenu = false,
  onEditPress,
  onDeletePress,
  isRecording = false,
  onRecordingChange,
  onVoiceTranscript,
  onVoiceError
}: EntryActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMorePress = () => {
    if (showContextMenu) {
      setShowMenu(true);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEditPress?.();
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDeletePress?.();
  };

  return (
    <>
      <View style={styles.actionsContainer}>
        {onVoiceTranscript && onVoiceError && onRecordingChange && (
          <VoiceRecorder
            onTranscript={onVoiceTranscript}
            onError={onVoiceError}
            isRecording={isRecording}
            onRecordingChange={onRecordingChange}
          />
        )}
        
        {onAIAnalysis && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onAIAnalysis}
          >
            <Sparkles size={20} color="#A5B8C8" strokeWidth={1.5} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={onSavePress}
        >
          <Check size={20} color="#FAFAFA" strokeWidth={1.5} />
        </TouchableOpacity>
        
        {showContextMenu && (
          <TouchableOpacity style={styles.actionButton} onPress={handleMorePress}>
            <MoreHorizontal size={20} color="#A5B8C8" strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </View>

      {showContextMenu && (
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.contextMenuContainer}>
              <TouchableOpacity style={styles.contextMenuItem} onPress={handleEdit}>
                <Text style={styles.contextMenuText}>Edit</Text>
              </TouchableOpacity>
              
              <View style={styles.contextMenuDivider} />
              
              <TouchableOpacity style={styles.contextMenuItem} onPress={handleDelete}>
                <Text style={[styles.contextMenuText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenuContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  contextMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contextMenuText: {
    fontSize: 16,
    color: '#2A2A2A',
    fontWeight: '300',
    textAlign: 'center',
  },
  deleteText: {
    color: '#EFCFD6',
  },
  contextMenuDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginHorizontal: 8,
  },
});