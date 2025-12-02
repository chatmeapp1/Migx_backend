
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface ChatItemProps {
  type: 'user' | 'room' | 'group';
  name: string;
  message?: string;
  time?: string;
  isOnline?: boolean;
  avatar?: string;
  tags?: string[];
}

const UserAvatar = ({ avatar, isOnline }: { avatar?: string; isOnline?: boolean }) => {
  if (avatar) {
    return (
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
    );
  }
  return null;
};

const RoomIcon = ({ size = 50 }: { size?: number }) => (
  <View style={[styles.roomIconContainer, { width: size, height: size }]}>
    <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#333" stroke="#333" strokeWidth="2" />
    </Svg>
  </View>
);

export function ChatItem({ type, name, message, time, isOnline, avatar, tags }: ChatItemProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.leftSection}>
        {type === 'user' ? (
          <UserAvatar avatar={avatar} isOnline={isOnline} />
        ) : (
          <RoomIcon />
        )}
        <View style={styles.contentSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {tags && tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          {message && <Text style={styles.message} numberOfLines={1}>{message}</Text>}
        </View>
      </View>
      {time && <Text style={styles.time}>{time}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7ED321',
    borderWidth: 2,
    borderColor: '#fff',
  },
  roomIconContainer: {
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
