import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useThemeCustom } from '@/theme/provider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

const ChatIcon = ({ size = 24, color = '#00bcd4' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </Svg>
);

const ProfilePrivacyIcon = ({ size = 24, color = '#00bcd4' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="19" cy="11" r="2" stroke={color} strokeWidth="2" />
    <Path d="M19 8v-1M19 14v1M16 11h-1M22 11h1" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LocationIcon = ({ size = 24, color = '#00bcd4' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    <Path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BlockIcon = ({ size = 24, color = '#00bcd4' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M4.93 4.93l14.14 14.14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CheckIcon = ({ size = 24, color = '#00bcd4' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function PrivacyScreen() {
  const { theme } = useThemeCustom();
  const [allowPrivateChat, setAllowPrivateChat] = useState('Everyone');
  const [profilePrivacy, setProfilePrivacy] = useState('Everyone');
  const [allowShareLocation, setAllowShareLocation] = useState(false);
  const [blockListCount, setBlockListCount] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('privacy_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setAllowPrivateChat(parsed.allowPrivateChat ?? 'Everyone');
        setProfilePrivacy(parsed.profilePrivacy ?? 'Everyone');
        setAllowShareLocation(parsed.allowShareLocation ?? false);
      }
      
      const blockedUsers = await AsyncStorage.getItem('blocked_users');
      if (blockedUsers) {
        const parsed = JSON.parse(blockedUsers);
        setBlockListCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const current = {
        allowPrivateChat,
        profilePrivacy,
        allowShareLocation,
        ...newSettings
      };
      await AsyncStorage.setItem('privacy_settings', JSON.stringify(current));
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const toggleShareLocation = () => {
    const newValue = !allowShareLocation;
    setAllowShareLocation(newValue);
    saveSettings({ allowShareLocation: newValue });
  };

  const iconColor = theme.primary;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Privacy</Text>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <ChatIcon size={24} color={iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Allow private chat from</Text>
              <Text style={[styles.menuSubtitle, { color: theme.secondary }]}>{allowPrivateChat}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <ProfilePrivacyIcon size={24} color={iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Profile Privacy</Text>
              <Text style={[styles.menuSubtitle, { color: theme.secondary }]}>{profilePrivacy}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={toggleShareLocation}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <LocationIcon size={24} color={iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Allow share my location</Text>
            </View>
            <View style={[styles.checkbox, allowShareLocation && { backgroundColor: iconColor, borderColor: iconColor }]}>
              {allowShareLocation && <CheckIcon size={16} color="#fff" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <BlockIcon size={24} color={iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Block lists</Text>
              <Text style={[styles.menuSubtitle, { color: theme.secondary }]}>{blockListCount}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: STATUSBAR_HEIGHT + 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  iconContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
