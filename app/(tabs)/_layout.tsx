
import { Tabs } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Platform, View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/HapticTab';
import { HomeIcon, RoomIcon, ChatIcon, ProfileIcon } from '@/components/ui/SvgIcons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import HomeScreen from './index';
import RoomScreen from './room';
import ChatScreen from './chat';
import ProfileScreen from './profile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 4;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const indicatorPosition = useSharedValue(0);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setCurrentIndex(newIndex);
    indicatorPosition.value = withSpring(newIndex * TAB_WIDTH, {
      damping: 20,
      stiffness: 90,
    });
  };

  const handleTabPress = (index: number) => {
    pagerRef.current?.setPage(index);
    setCurrentIndex(index);
    indicatorPosition.value = withSpring(index * TAB_WIDTH, {
      damping: 20,
      stiffness: 90,
    });
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const tabs = [
    { name: 'Home', icon: HomeIcon, component: HomeScreen },
    { name: 'Room', icon: RoomIcon, component: RoomScreen },
    { name: 'Chat', icon: ChatIcon, component: ChatScreen },
    { name: 'Profile', icon: ProfileIcon, component: ProfileScreen },
  ];

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {tabs.map((tab, index) => (
          <View key={index} style={styles.page}>
            <tab.component />
          </View>
        ))}
      </PagerView>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
            borderTopColor: colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].tint,
            },
            indicatorStyle,
          ]}
        />
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = currentIndex === index;
          const color = isActive
            ? Colors[colorScheme ?? 'light'].tint
            : Colors[colorScheme ?? 'light'].tabIconDefault;

          return (
            <HapticTab
              key={index}
              onPress={() => handleTabPress(index)}
              style={styles.tabButton}
            >
              <Icon size={28} color={color} />
            </HapticTab>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        paddingBottom: 20,
        height: 80,
      },
    }),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: TAB_WIDTH,
    height: 3,
    borderRadius: 2,
  },
});
