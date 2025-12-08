import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import { API_ENDPOINTS } from '@/utils/api';

interface StatItemProps {
  label: string;
  value: number;
  onPress?: () => void;
}

function StatItem({ label, value, onPress }: StatItemProps) {
  const { theme } = useThemeCustom();

  return (
    <TouchableOpacity
      style={styles.statItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.statLabel, { color: theme.text + 'CC' }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </TouchableOpacity>
  );
}

interface EditProfileStatsProps {
  userId: string;
  onPostPress?: () => void;
  onGiftPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

export function EditProfileStats({
  userId,
  onPostPress,
  onGiftPress,
  onFollowersPress,
  onFollowingPress,
}: EditProfileStatsProps) {
  const { theme } = useThemeCustom();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    postCount: 0,
    giftCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PROFILE.STATS(userId));
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity style={styles.statButton} onPress={onPostPress}>
        <View style={styles.statItem}>
          <Text style={[styles.statCount, { color: theme.text }]}>{stats.postCount}</Text>
          <Text style={[styles.statLabel, { color: theme.text + 'CC' }]}>Post</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statButton} onPress={onGiftPress}>
        <View style={styles.statItem}>
          <Text style={[styles.statCount, { color: theme.text }]}>{stats.giftCount}</Text>
          <Text style={[styles.statLabel, { color: theme.text + 'CC' }]}>Gift</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statButton} onPress={onFollowersPress}>
        <View style={styles.statItem}>
          <Text style={[styles.statCount, { color: theme.text }]}>{stats.followersCount}</Text>
          <Text style={[styles.statLabel, { color: theme.text + 'CC' }]}>Followers</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statButton} onPress={onFollowingPress}>
        <View style={styles.statItem}>
          <Text style={[styles.statCount, { color: theme.text }]}>{stats.followingCount}</Text>
          <Text style={[styles.statLabel, { color: theme.text + 'CC' }]}>Following</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statButton: {
    flex: 1,
  },
  divider: {
    width: 1,
  },
});