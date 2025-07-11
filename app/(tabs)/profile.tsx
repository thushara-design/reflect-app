import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Switch, Alert, Linking, SafeAreaView } from 'react-native';
import { useState, useRef } from 'react';
import { Calendar, TrendingUp, Heart, Bell, ChartBar as BarChart3, Phone, Settings, CreditCard as Edit3, X, Plus, Trash2, Download, Brain, Zap, PenTool } from 'lucide-react-native';
import TopNavBar from '@/components/TopNavBar';
import { useEntries } from '@/contexts/EntriesContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';
import CrisisHelpModal from '@/components/CrisisHelpModal';
import ActivityManagementModal from '@/components/ActivityManagementModal';
import OpenMojiIcon from '@/components/OpenMojiIcon';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { entries } = useEntries();
  const { userProfile, updateUserName, updateAIPreference, resetOnboarding } = useOnboarding();
  const { colors } = useTheme();
  
  // Modal states
  const [showEditName, setShowEditName] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const [showActivityManagement, setShowActivityManagement] = useState(false);
  
  // Form states
  const [editingName, setEditingName] = useState(userProfile?.name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [useAI, setUseAI] = useState(userProfile?.useAI ?? true);
  
  // Calculate stats from actual entries
  const totalEntries = entries.length;
  const thisMonth = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }).length;
  
  // Calculate streak (simplified - consecutive days with entries)
  const calculateStreak = () => {
    const sortedEntries = [...entries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays === streak + 1) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = [
    { label: 'Total Entries', value: totalEntries.toString(), color: colors.primary },
    { label: 'Streak', value: `${calculateStreak()} days`, color: colors.accent },
    { label: 'This Month', value: thisMonth.toString(), color: colors.primary },
  ];

  const handleSaveName = async () => {
    if (editingName.trim()) {
      await updateUserName(editingName.trim());
      setShowEditName(false);
    }
  };

  const handleAIToggle = async (value: boolean) => {
    setUseAI(value);
    await updateAIPreference(value);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your journal entries will be exported as a JSON file. This feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  // Get latest entry for activity display
  const latestEntry = entries.length > 0 ? entries[0] : null;

  // Secret triple-tap state for dev onboarding reset
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<any>(null);

  const handleFooterTap = async () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    setTapCount(prev => {
      const next = prev + 1;
      if (next === 3) {
        setTapCount(0);
        setTimeout(async () => {
          await resetOnboarding();
          router.replace('/onboarding/welcome');
        }, 150); // slight delay for UX
      } else {
        tapTimeoutRef.current = setTimeout(() => setTapCount(0), 1000);
      }
      return next === 3 ? 0 : next;
    });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    header: {
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 30,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 32,
      fontWeight: '300',
      color: '#181818',
    },
    editNameButton: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 8,
      borderWidth: 2,
      borderColor: colors.background,
    },
    welcomeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: '300',
      color: '#181818',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '300',
      marginTop: 4,
    },
    statsSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '400',
      color: '#181818',
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: 'flex-start',
      position: 'relative',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '300',
      color: '#181818',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '300',
    },
    statIndicator: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    activitySection: {
      marginBottom: 30,
    },
    activityCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    activityDate: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    activityText: {
      fontSize: 14,
      color: '#181818',
      lineHeight: 20,
      fontWeight: '300',
    },
    featuresSection: {
      marginBottom: 30,
    },
    featureItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
    },
    featureLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      color: '#181818',
      fontWeight: '400',
      marginBottom: 2,
    },
    featureDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '300',
      lineHeight: 18,
    },
    menuSection: {
      marginBottom: 30,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuTitle: {
      fontSize: 16,
      color: '#181818',
      fontWeight: '300',
    },
    footer: {
      alignItems: 'center',
      paddingBottom: 20,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '300',
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 11,
      color: colors.border,
      fontWeight: '300',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '400',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    textInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '400',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '300',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <TopNavBar title="Profile" showDarkMode={true} showSignOut={true} />

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.avatarContainer}>
            <View style={[dynamicStyles.avatar, { backgroundColor: colors.accent }]}> 
              <OpenMojiIcon 
                uri="https://openmoji.org/data/black/svg/1F344.svg"
                width={48}
                height={48}
              />
            </View>
          </View>
          <View style={dynamicStyles.welcomeContainer}>
            <Text style={dynamicStyles.welcomeText}>
              {userProfile?.name ? `${userProfile.name}` : 'Welcome back'}
            </Text>
            {userProfile?.name && (
              <TouchableOpacity 
                style={{ marginLeft: 8 }}
                onPress={() => setShowEditName(true)}
              >
                <PenTool size={16} color={colors.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={dynamicStyles.statsSection}>
          <View style={dynamicStyles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={[dynamicStyles.statCard, { alignItems: 'flex-start', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 8 }]}> 
                <Text style={{ fontSize: 18, color: '#181818', fontWeight: '500', marginBottom: 2 }}>{stat.value}</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '300' }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Main Features */}
        <View style={dynamicStyles.featuresSection}>
          <Text style={dynamicStyles.sectionTitle}>Features</Text>
          
          {/* Suggested Activities */}
          <TouchableOpacity style={dynamicStyles.featureItem} onPress={() => setShowActivityManagement(true)}>
            <View style={dynamicStyles.featureLeft}>
              <View style={[dynamicStyles.featureIcon, { backgroundColor: colors.primary + '15' }]}> 
                <Heart size={20} color={colors.primary} strokeWidth={1.5} />
              </View>
              <View style={dynamicStyles.featureContent}>
                <Text style={dynamicStyles.featureTitle}>Suggested Activities</Text>
                <Text style={dynamicStyles.featureDescription}>Manage your personalized coping activities for different emotions</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Use AI */}
          <View style={dynamicStyles.featureItem}>
            <View style={dynamicStyles.featureLeft}>
              <View style={[dynamicStyles.featureIcon, { backgroundColor: colors.accent }]}> 
                <Brain size={20} color={colors.primary} strokeWidth={1.5} />
              </View>
              <View style={dynamicStyles.featureContent}>
                <Text style={dynamicStyles.featureTitle}>Use AI</Text>
                <Text style={dynamicStyles.featureDescription}>Enable AI-powered insights and suggestions</Text>
              </View>
              <Switch
                value={useAI}
                onValueChange={handleAIToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {/* Crisis Help */}
          <TouchableOpacity style={dynamicStyles.featureItem} onPress={() => setShowCrisisHelp(true)}>
            <View style={dynamicStyles.featureLeft}>
              <View style={[dynamicStyles.featureIcon, { backgroundColor: colors.accentSecondary }]}> 
                <Phone size={20} color={colors.text} strokeWidth={1.5} />
              </View>
              <View style={dynamicStyles.featureContent}>
                <Text style={dynamicStyles.featureTitle}>Crisis Help</Text>
                <Text style={dynamicStyles.featureDescription}>24/7 support resources when you need them most</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={dynamicStyles.footer}>
          <TouchableOpacity activeOpacity={1} onPress={handleFooterTap}>
            <Text style={dynamicStyles.footerText}>Reflect v1.0.0</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.footerSubtext}>Made with care for your wellbeing</Text>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditName}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditName(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Edit Name</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity 
                style={[dynamicStyles.modalButton, dynamicStyles.secondaryButton]}
                onPress={() => setShowEditName(false)}
              >
                <Text style={dynamicStyles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[dynamicStyles.modalButton, dynamicStyles.primaryButton]}
                onPress={handleSaveName}
              >
                <Text style={dynamicStyles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Crisis Help Modal */}
      <CrisisHelpModal
        visible={showCrisisHelp}
        onClose={() => setShowCrisisHelp(false)}
      />

      {/* Activity Management Modal */}
      <ActivityManagementModal
        visible={showActivityManagement}
        onClose={() => setShowActivityManagement(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
});