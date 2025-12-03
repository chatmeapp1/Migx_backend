import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeCustom } from '@/theme/provider';

const MoonIcon = ({ size = 24, color = "#4A90E2" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
      fill={color} 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export function ModeToggle() {
  const { theme, isDark, toggleTheme } = useThemeCustom();

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.border }]}>
          <MoonIcon size={24} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={isDark ? '#fff' : '#f4f3f4'}
        />
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
});
