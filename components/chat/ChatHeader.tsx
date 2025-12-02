
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const StatsIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3v18h18" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 17V9M13 17V5M8 17v-3" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export function ChatHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <StatsIcon size={18} />
        <Text style={styles.statsText}>89.2k users. 12.8k rooms. 383.4k groups.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8E8E8',
    paddingTop: 8,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#E8E8E8',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
