
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeCustom } from '@/theme/provider';
import Svg, { Circle } from 'react-native-svg';

interface RoomItemProps {
  id: string;
  name: string;
  userCount: string;
}

const RoomIcon = ({ size = 18, color = '#4A90E2' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
  </Svg>
);

export function RoomItem({ id, name, userCount }: RoomItemProps) {
  const router = useRouter();
  const { theme } = useThemeCustom();

  const handlePress = () => {
    router.push({
      pathname: '/chatroom/[id]',
      params: { id, name },
    });
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.card }]} onPress={handlePress}>
      <View style={styles.leftSection}>
        <RoomIcon size={16} color={theme.primary} />
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
      </View>
      <Text style={[styles.userCount, { color: theme.secondary }]}>{userCount}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginBottom: 2,
    borderRadius: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  userCount: {
    fontSize: 13,
  },
});
