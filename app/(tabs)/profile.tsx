import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, TrendingUp, Heart, Bell, ChartBar as BarChart3, Phone, Settings } from 'lucide-react-native';
import TopNavBar from '@/components/TopNavBar';
import { useEntries } from '@/contexts/EntriesContext';

export default function ProfileTab() {
  const { entries } = useEntries();
  
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
    { label: 'Total Entries', value: totalEntries.toString(), color: '#A5B8C8' },
    { label: 'Current Streak', value: `${calculateStreak()} days`, color: '#EFCFD6' },
    { label: 'This Month', value: thisMonth.toString(), color: '#A5B8C8' },
  ];

  const mainMenuItems = [
    { id: 1, title: 'Insights', icon: BarChart3, description: 'View your progress and patterns' },
    { id: 2, title: 'Crisis Help', icon: Phone, description: '24/7 support when you need it' },
  ];

  const settingsItems = [
    { id: 3, title: 'Notifications', icon: Bell },
    { id: 4, title: 'Export Data', icon: TrendingUp },
    { id: 5, title: 'Settings', icon: Settings },
  ];

  // Get latest entry for activity display
  const latestEntry = entries.length > 0 ? entries[0] : null;

  return (
    <View style={styles.container}>
      <TopNavBar title="Profile" showDarkMode={true} showSignOut={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subtitle}>Your reflection journey</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.statIndicator, { backgroundColor: stat.color }]} />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Calendar size={16} color="#A5B8C8" strokeWidth={1.5} />
              <Text style={styles.activityDate}>
                {latestEntry ? `Last entry: ${latestEntry.date}` : 'No entries yet'}
              </Text>
            </View>
            <Text style={styles.activityText}>
              {latestEntry 
                ? "You've been consistent with your journaling this week. Keep up the great work!"
                : "Start your reflection journey by creating your first entry."
              }
            </Text>
          </View>
        </View>

        {/* Main Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          {mainMenuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.featureItem}>
              <View style={styles.featureLeft}>
                <View style={[styles.featureIcon, { backgroundColor: item.id === 2 ? '#EFCFD6' : '#A5B8C8' + '15' }]}>
                  <item.icon 
                    size={20} 
                    color={item.id === 2 ? '#2A2A2A' : '#A5B8C8'} 
                    strokeWidth={1.5} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDescription}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settingsItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <item.icon size={18} color="#A5B8C8" strokeWidth={1.5} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Reflect v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with care for your wellbeing</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A5B8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FAFAFA',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2A2A2A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#A5B8C8',
    fontWeight: '300',
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2A2A2A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '300',
    color: '#2A2A2A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A5B8C8',
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
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#A5B8C8',
    fontWeight: '300',
  },
  activityText: {
    fontSize: 14,
    color: '#2A2A2A',
    lineHeight: 20,
    fontWeight: '300',
  },
  featuresSection: {
    marginBottom: 30,
  },
  featureItem: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
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
    color: '#2A2A2A',
    fontWeight: '400',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#A5B8C8',
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
    borderBottomColor: '#EAEAEA',
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
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#2A2A2A',
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#A5B8C8',
    fontWeight: '300',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#EAEAEA',
    fontWeight: '300',
  },
});