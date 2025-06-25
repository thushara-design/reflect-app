import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Share } from 'react-native';
import { useState } from 'react';
import { X, Download, Upload, Trash2, FileText } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useDataPersistence } from '@/contexts/DataPersistenceContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface DataExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DataExportModal({ visible, onClose }: DataExportModalProps) {
  const { colors } = useTheme();
  const { exportData, importData, clearAllData } = useDataPersistence();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const fileName = `reflect-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Create a temporary file
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, data);
      
      // Share the file
      await Share.share({
        url: fileUri,
        title: 'Reflect Journal Backup',
        message: 'Your Reflect journal backup file'
      });
      
      Alert.alert(
        'Export Successful',
        'Your journal data has been exported. Save this file in a secure location.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        
        Alert.alert(
          'Import Data',
          'This will replace all your current data. Are you sure you want to continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              style: 'destructive',
              onPress: async () => {
                try {
                  await importData(fileContent);
                  Alert.alert(
                    'Import Successful',
                    'Your data has been imported. Please restart the app to see the changes.',
                    [{ text: 'OK', onPress: onClose }]
                  );
                } catch (error) {
                  Alert.alert('Import Failed', 'The file format is invalid or corrupted.');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Import Failed', 'Unable to read the selected file.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your journal entries, settings, and personal data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert(
                'Data Cleared',
                'All your data has been deleted. Please restart the app.',
                [{ text: 'OK', onPress: onClose }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '400',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    actionButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    exportButton: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    importButton: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    dangerButton: {
      borderColor: '#FF6B6B',
      backgroundColor: '#FF6B6B10',
    },
    actionIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exportIcon: {
      backgroundColor: colors.primary,
    },
    importIcon: {
      backgroundColor: colors.primary,
    },
    dangerIcon: {
      backgroundColor: '#FF6B6B',
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    warningBox: {
      backgroundColor: '#FF9800' + '15',
      borderWidth: 1,
      borderColor: '#FF9800',
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    warningTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#FF9800',
      marginBottom: 8,
    },
    warningText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Data Management</Text>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
          {/* Export Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Backup Your Data</Text>
            <Text style={dynamicStyles.sectionDescription}>
              Create a backup file of all your journal entries, settings, and personal data.
            </Text>
            
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.exportButton]}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <View style={[dynamicStyles.actionIcon, dynamicStyles.exportIcon]}>
                <Download size={20} color={colors.background} strokeWidth={1.5} />
              </View>
              <View style={dynamicStyles.actionContent}>
                <Text style={dynamicStyles.actionTitle}>
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Text>
                <Text style={dynamicStyles.actionDescription}>
                  Download a backup file of all your journal data
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Import Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Restore From Backup</Text>
            <Text style={dynamicStyles.sectionDescription}>
              Import a previously exported backup file to restore your data.
            </Text>
            
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.importButton]}
              onPress={handleImportData}
              disabled={isImporting}
            >
              <View style={[dynamicStyles.actionIcon, dynamicStyles.importIcon]}>
                <Upload size={20} color={colors.background} strokeWidth={1.5} />
              </View>
              <View style={dynamicStyles.actionContent}>
                <Text style={dynamicStyles.actionTitle}>
                  {isImporting ? 'Importing...' : 'Import Data'}
                </Text>
                <Text style={dynamicStyles.actionDescription}>
                  Restore your data from a backup file
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Clear Data Section */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Reset App</Text>
            <Text style={dynamicStyles.sectionDescription}>
              Permanently delete all your data and start fresh.
            </Text>
            
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.dangerButton]}
              onPress={handleClearAllData}
            >
              <View style={[dynamicStyles.actionIcon, dynamicStyles.dangerIcon]}>
                <Trash2 size={20} color={colors.background} strokeWidth={1.5} />
              </View>
              <View style={dynamicStyles.actionContent}>
                <Text style={dynamicStyles.actionTitle}>Clear All Data</Text>
                <Text style={dynamicStyles.actionDescription}>
                  Permanently delete all journal entries and settings
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.warningBox}>
            <Text style={dynamicStyles.warningTitle}>Important Notes</Text>
            <Text style={dynamicStyles.warningText}>
              • Backup files contain all your personal journal data{'\n'}
              • Store backup files in a secure location{'\n'}
              • Importing data will replace all current data{'\n'}
              • Clearing data cannot be undone
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}