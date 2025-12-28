import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BackIcon } from '@/components/ui/SvgIcons';
import { useThemeCustom } from '@/theme/provider';
import { getLevelConfig } from '@/utils/levelMapping';
import Svg, { Circle, Path } from 'react-native-svg';
import API_BASE_URL from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivateChatHeaderProps {
  username: string;
  targetUserId?: string;
  onBack?: () => void;
  onMenuPress?: () => void;
}

const ThreeDotsIcon = ({ color = '#fff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="2" fill={color} />
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Circle cx="12" cy="19" r="2" fill={color} />
  </Svg>
);

const AddIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 9v6M9 12h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export function PrivateChatHeader({ 
  username, 
  targetUserId,
  onBack, 
  onMenuPress 
}: PrivateChatHeaderProps) {
  const router = useRouter();
  const { theme } = useThemeCustom();
  const [userLevel, setUserLevel] = useState(1);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(username);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [username, targetUserId]);

  const fetchUserData = async () => {
    try {
      let response;
      if (targetUserId) {
        response = await fetch(`${API_BASE_URL}/api/users/${targetUserId}`);
      } else {
        response = await fetch(`${API_BASE_URL}/api/users/username/${username}`);
      }
      
      const data = await response.json();
      
      if (data) {
        if (data.level) setUserLevel(data.level);
        if (data.avatar) {
          const avatarUrl = data.avatar.startsWith('http') 
            ? data.avatar 
            : `${API_BASE_URL}${data.avatar.startsWith('/') ? '' : '/'}${data.avatar}`;
          setUserAvatar(avatarUrl);
        }
        if (data.username) setDisplayName(data.username);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleFollowPress = async () => {
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) {
        Alert.alert('Error', 'Please login first');
        return;
      }
      const currentUser = JSON.parse(userDataStr);

      const response = await fetch(`${API_BASE_URL}/api/profile/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: currentUser.id,
          followingId: targetUserId || displayName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', `You are following ${displayName}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to follow user');
      }
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('Error', 'Failed to follow user');
    } finally {
      setFollowLoading(false);
    }
  };

  const levelConfig = getLevelConfig(userLevel);
  const levelIconSource = typeof levelConfig.icon === 'number' ? levelConfig.icon : require('@/assets/ic_level/ic_eggwhite.png');

  return (
    <View style={[styles.container, { backgroundColor: '#0a5229' }]}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            onPress={onBack ? onBack : () => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackIcon color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatarImage} onError={() => setUserAvatar(null)} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.username} numberOfLines={1}>{displayName}</Text>
            <View style={styles.levelBadge}>
              <Image source={levelIconSource} style={styles.levelIcon} />
              <Text style={styles.levelNumber}>[{userLevel}]</Text>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity 
            onPress={handleFollowPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={followLoading}
          >
            <AddIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onMenuPress}
            style={styles.menuButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThreeDotsIcon color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  levelNumber: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 8,
  },
});
