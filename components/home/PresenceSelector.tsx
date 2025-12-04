
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import { PresenceStatus } from '@/hooks/usePresence';

interface PresenceSelectorProps {
  visible: boolean;
  currentStatus: PresenceStatus;
  onClose: () => void;
  onSelect: (status: PresenceStatus) => void;
}

const presenceOptions: Array<{
  status: PresenceStatus;
  label: string;
  description: string;
  color: string;
}> = [
  {
    status: 'online',
    label: 'Online',
    description: 'Available - User aktif',
    color: '#4CAF50',
  },
  {
    status: 'away',
    label: 'Away',
    description: 'Away - User idle / tidak di layar',
    color: '#FFC107',
  },
  {
    status: 'busy',
    label: 'Busy',
    description: 'Do Not Disturb (DND) - Tidak ingin diganggu',
    color: '#F44336',
  },
  {
    status: 'invisible',
    label: 'Invisible',
    description: 'Invisible - User online tapi tampak offline',
    color: '#9E9E9E',
  },
  {
    status: 'offline',
    label: 'Offline',
    description: 'Offline - Tidak aktif / disconnect',
    color: '#757575',
  },
];

export function PresenceSelector({ visible, currentStatus, onClose, onSelect }: PresenceSelectorProps) {
  const { theme } = useThemeCustom();

  const handleSelect = (status: PresenceStatus) => {
    onSelect(status);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Set Presence Status</Text>
          
          {presenceOptions.map((option) => (
            <TouchableOpacity
              key={option.status}
              style={[
                styles.option,
                { 
                  backgroundColor: currentStatus === option.status ? theme.background : 'transparent',
                  borderBottomColor: theme.border,
                }
              ]}
              onPress={() => handleSelect(option.status)}
            >
              <View style={[styles.statusDot, { backgroundColor: option.color }]} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
                <Text style={[styles.optionDescription, { color: theme.secondary }]}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
  },
});
