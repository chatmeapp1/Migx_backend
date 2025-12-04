
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import { usePresence, PresenceStatus } from '@/hooks/usePresence';
import { PresenceSelector } from './PresenceSelector';

type PresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'invisible';

interface UserProfileSectionProps {
  username?: string;
  level?: number;
  initialStatus?: string;
  presenceStatus?: PresenceStatus;
  avatar?: string;
}

const getStatusColor = (status: PresenceStatus) => {
  switch (status) {
    case 'online':
      return '#4CAF50'; // Green
    case 'away':
      return '#FFC107'; // Yellow/Orange
    case 'busy':
      return '#F44336'; // Red
    case 'offline':
      return '#9E9E9E'; // Gray
    case 'invisible':
      return '#9E9E9E'; // Gray (appears offline)
    default:
      return '#9E9E9E';
  }
};

const getStatusBorderColor = (status: PresenceStatus) => {
  switch (status) {
    case 'online':
      return '#388E3C';
    case 'away':
      return '#F57C00';
    case 'busy':
      return '#D32F2F';
    case 'offline':
      return '#757575';
    case 'invisible':
      return '#757575';
    default:
      return '#757575';
  }
};

export function UserProfileSection({ 
  username = 'h________', 
  level = 1,
  initialStatus = '',
  presenceStatus = 'online',
  avatar = '👤'
}: UserProfileSectionProps) {
  const { theme } = useThemeCustom();
  const [statusMessage, setStatusMessage] = useState(initialStatus);
  const { status, setStatus } = usePresence(username);
  const [showPresenceSelector, setShowPresenceSelector] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: '#FF9800' }]}>
      <View style={styles.profileRow}>
        {/* Avatar with status indicator */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => setShowPresenceSelector(true)}
        >
          <View style={[styles.avatar, { backgroundColor: '#4A90E2' }]}>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
          <View 
            style={[
              styles.statusIndicator, 
              { 
                backgroundColor: getStatusColor(status),
                borderColor: getStatusBorderColor(status)
              }
            ]} 
          />
        </TouchableOpacity>

        {/* Username and level */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{username}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>[lvl{level}]</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status message input */}
      <View style={styles.statusInputContainer}>
        <TextInput
          style={[styles.statusInput, { color: theme.secondary }]}
          placeholder="<Enter your status message>"
          placeholderTextColor="#666"
          value={statusMessage}
          onChangeText={setStatusMessage}
          multiline={false}
        />
      </View>

      <PresenceSelector
        visible={showPresenceSelector}
        currentStatus={status}
        onClose={() => setShowPresenceSelector(false)}
        onSelect={setStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusInputContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusInput: {
    fontSize: 14,
    color: '#999',
    padding: 0,
  },
});
