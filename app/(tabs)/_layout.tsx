
import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/HapticTab';
import { HomeIcon, RoomIcon, ChatIcon, ProfileIcon } from '@/components/ui/SvgIcons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const TAB_ROUTES = ['index', 'room', 'chat', 'profile'];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const currentRoute = segments[segments.length - 1];
    const index = TAB_ROUTES.indexOf(currentRoute as string);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [segments]);

  const handleIndexChange = (newIndex: number) => {
    setCurrentIndex(newIndex);
    const route = TAB_ROUTES[newIndex];
    if (route === 'index') {
      router.push('/(tabs)/');
    } else {
      router.push(`/(tabs)/${route}` as any);
    }
  };

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {
              backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
            },
          }),
        }}
        screenListeners={{
          tabPress: (e) => {
            const routeName = e.target?.split('-')[0];
            const index = TAB_ROUTES.indexOf(routeName as string);
            if (index !== -1) {
              handleIndexChange(index);
            }
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="room"
          options={{
            title: 'Room',
            tabBarIcon: ({ color }) => <RoomIcon size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => <ChatIcon size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <ProfileIcon size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
});
