import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking, Alert } from 'react-native';
import { X, Phone, MessageCircle, Globe, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CrisisHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CrisisHelpModal({ visible, onClose }: CrisisHelpModalProps) {
  const { colors } = useTheme();

  const crisisResources = [
    {
      id: 'suicide-prevention',
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 free and confidential support for people in distress',
      type: 'call',
      urgent: true,
    },
    {
      id: 'crisis-text',
      name: 'Crisis Text Line',
      number: '741741',
      description: 'Text HOME to 741741 for 24/7 crisis support',
      type: 'text',
      urgent: true,
    },
    {
      id: 'samhsa',
      name: 'SAMHSA National Helpline',
      number: '1-800-662-4357',
      description: 'Treatment referral and information service',
      type: 'call',
      urgent: false,
    },
    {
      id: 'nami',
      name: 'NAMI HelpLine',
      number: '1-800-950-6264',
      description: 'Information, referrals and support for mental health',
      type: 'call',
      urgent: false,
    },
    {
      id: 'domestic-violence',
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      description: '24/7 confidential support for domestic violence',
      type: 'call',
      urgent: false,
    },
  ];

  const handleCall = (number: string, name: string) => {
    Alert.alert(
      'Call ' + name,
      `Are you sure you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Error', 'Unable to make phone call');
            });
          }
        }
      ]
    );
  };

  const handleText = (number: string) => {
    Linking.openURL(`sms:${number}`).catch(() => {
      Alert.alert('Error', 'Unable to open messaging app');
    });
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
    },
    urgentSection: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 24,
      marginVertical: 24,
    },
    urgentTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.error,
      marginBottom: 8,
      textAlign: 'center',
    },
    urgentSubtitle: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    resourceCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    urgentCard: {
      borderColor: colors.error,
      backgroundColor: colors.background,
    },
    resourceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    resourceName: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
      flex: 1,
    },
    resourceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 18,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    callButton: {
      backgroundColor: colors.primary,
    },
    textButton: {
      backgroundColor: colors.accentSecondary,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '400',
    },
    callButtonText: {
      color: colors.background,
      fontWeight: '600',
    },
    textButtonText: {
      color: colors.text,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    disclaimer: {
      backgroundColor: colors.accentSecondary,
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.accentSecondary,
    },
    disclaimerTitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 8,
    },
    disclaimerText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });

  const urgentResources = crisisResources.filter(r => r.urgent);
  const otherResources = crisisResources.filter(r => !r.urgent);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>Crisis Support</Text>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
          <View style={dynamicStyles.urgentSection}>
            <Text style={dynamicStyles.urgentTitle}>🚨 Immediate Help</Text>
            <Text style={dynamicStyles.urgentSubtitle}>
              If you're having thoughts of suicide or self-harm, please reach out immediately. You are not alone.
            </Text>
            
            {urgentResources.map((resource) => (
              <View key={resource.id} style={[dynamicStyles.resourceCard, dynamicStyles.urgentCard]}>
                <View style={dynamicStyles.resourceHeader}>
                  <Text style={{ fontSize: 18, color: '#181818', fontWeight: '700' }}>{resource.name}</Text>

                </View>
                <Text style={{ fontSize: 15, color: '#181818', fontWeight: '600' }}>{resource.description}</Text>
                <View style={dynamicStyles.actionButtons}>
                  {resource.type === 'call' ? (
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.callButton]}
                      onPress={() => handleCall(resource.number, resource.name)}
                    >
                      <Phone size={16} color={colors.background} strokeWidth={1.5} />
                      <Text style={[dynamicStyles.actionButtonText, dynamicStyles.callButtonText]}>
                        Call {resource.number}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[dynamicStyles.actionButton, dynamicStyles.textButton]}
                      onPress={() => handleText(resource.number)}
                    >
                      <MessageCircle size={16} color={colors.text} strokeWidth={1.5} />
                      <Text style={[dynamicStyles.actionButtonText, dynamicStyles.textButtonText]}>
                        Text {resource.number}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          <Text style={dynamicStyles.sectionTitle}>Additional Resources</Text>
          
          {otherResources.map((resource) => (
            <View key={resource.id} style={dynamicStyles.resourceCard}>
              <Text style={{ fontSize: 18, color: '#181818', fontWeight: '700' }}>{resource.name}</Text>
              <Text style={{ fontSize: 15, color: '#181818', fontWeight: '600' }}>{resource.description}</Text>
              <TouchableOpacity
                style={[dynamicStyles.actionButton, dynamicStyles.callButton]}
                onPress={() => handleCall(resource.number, resource.name)}
              >
                <Phone size={16} color={colors.background} strokeWidth={1.5} />
                <Text style={[dynamicStyles.actionButtonText, dynamicStyles.callButtonText]}>
                  Call {resource.number}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={dynamicStyles.disclaimer}>
            <Text style={dynamicStyles.disclaimerTitle}>Important Note</Text>
            <Text style={dynamicStyles.disclaimerText}>
              These resources are provided for informational purposes. In case of a medical emergency, please call 911 immediately. This app is not a substitute for professional medical advice, diagnosis, or treatment.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}