
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import Svg, { Path } from 'react-native-svg';
import { API_ENDPOINTS } from '@/utils/api';

const StatsIcon = ({ size = 20, color = '#4A90E2' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3v18h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 17V9M13 17V5M8 17v-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export function ChatHeader() {
  const { theme } = useThemeCustom();
  const [stats, setStats] = useState({
    users: 0,
    rooms: 0,
    groups: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ROOM.LIST);
      const data = await response.json();
      
      if (data.success) {
        const totalUsers = data.rooms.reduce((sum: number, room: any) => sum + room.user_count, 0);
        setStats({
          users: totalUsers,
          rooms: data.rooms.length,
          groups: data.rooms.filter((r: any) => r.is_private).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={[styles.statsBar, { backgroundColor: theme.card }]}>
        <StatsIcon size={18} color={theme.primary} />
        <Text style={[styles.statsText, { color: theme.secondary }]}>
          {formatNumber(stats.users)} users. {formatNumber(stats.rooms)} rooms. {formatNumber(stats.groups)} groups.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
