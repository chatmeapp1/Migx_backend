
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

const CloseIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#4A90E2" strokeWidth="2" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CalendarIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" 
      fill="#888"
    />
  </Svg>
);

export default function OfficialCommentScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Official Announcements</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <CloseIcon size={32} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>Welcome migx community</Text>
          <Text style={styles.announcementText}>
            Coming soon migx chat community
          </Text>
          <View style={styles.dateContainer}>
            <CalendarIcon size={18} />
            <Text style={styles.dateText}>Nov 30, 2025</Text>
          </View>
        </View>

        <View style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>Account Verification</Text>
          <Text style={styles.announcementText}>
            We inform all users since we activated the Email verification system, We ask all users to verify their account by sending a...
          </Text>
          <View style={styles.dateContainer}>
            <CalendarIcon size={18} />
            <Text style={styles.dateText}>Nov 30, 2025</Text>
          </View>
        </View>

        <View style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>Official Contest</Text>
          <Text style={styles.announcementText}>
            Perhatian ‼️ Mohon maaf atas ketidaknyamanan ini. Kami memberitahukan bahwa event 8Ball haru...
          </Text>
          <View style={styles.dateContainer}>
            <CalendarIcon size={18} />
            <Text style={styles.dateText}>Nov 24, 2025</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D63384',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  announcementText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
});
