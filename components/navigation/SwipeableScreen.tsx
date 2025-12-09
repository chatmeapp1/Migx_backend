import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 40;
const VELOCITY_THRESHOLD = 250;
const MAX_TAB_INDEX = 4;

const PATH_TO_INDEX: Record<string, number> = {
  '/': 0,
  '/index': 0,
  '/chat': 1,
  '/feed': 2,
  '/room': 3,
  '/profile': 4,
  '/(tabs)': 0,
  '/(tabs)/index': 0,
  '/(tabs)/chat': 1,
  '/(tabs)/feed': 2,
  '/(tabs)/room': 3,
  '/(tabs)/profile': 4,
};

const INDEX_TO_ROUTE: Record<number, string> = {
  0: '/(tabs)',
  1: '/(tabs)/chat',
  2: '/(tabs)/feed',
  3: '/(tabs)/room',
  4: '/(tabs)/profile',
};

interface SwipeableScreenProps {
  children: React.ReactNode;
}

export function SwipeableScreen({ children }: SwipeableScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useSharedValue(0);
  const isNavigating = useRef(false);
  const currentIndexRef = useRef(0);
  
  const currentIndex = PATH_TO_INDEX[pathname] ?? 0;
  
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const doNavigation = useCallback((nextIndex: number) => {
    if (isNavigating.current) return;
    if (nextIndex < 0 || nextIndex > MAX_TAB_INDEX) return;
    
    isNavigating.current = true;
    
    const route = INDEX_TO_ROUTE[nextIndex];
    if (route) {
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
      }
      
      try {
        router.replace(route as any);
      } catch (e) {}
    }
    
    setTimeout(() => {
      isNavigating.current = false;
    }, 150);
  }, [router]);

  const handleSwipeEnd = useCallback((translationX: number, velocityX: number) => {
    const idx = currentIndexRef.current;
    const canLeft = idx < MAX_TAB_INDEX;
    const canRight = idx > 0;
    
    const shouldGoNext = (translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD) && canLeft;
    const shouldGoPrev = (translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD) && canRight;
    
    if (shouldGoNext) {
      doNavigation(idx + 1);
    } else if (shouldGoPrev) {
      doNavigation(idx - 1);
    }
  }, [doNavigation]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      const idx = currentIndexRef.current;
      const canRight = idx > 0;
      const canLeft = idx < MAX_TAB_INDEX;
      
      const normalizedX = event.translationX / SCREEN_WIDTH;
      let tx = normalizedX * 60;
      
      if (!canRight && tx > 0) {
        tx *= 0.1;
      }
      if (!canLeft && tx < 0) {
        tx *= 0.1;
      }
      
      translateX.value = Math.max(-25, Math.min(25, tx));
    })
    .onEnd((event) => {
      runOnJS(handleSwipeEnd)(event.translationX, event.velocityX);
      translateX.value = withTiming(0, { duration: 120 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, 25],
      [1, 0.95],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
