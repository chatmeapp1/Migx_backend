
import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeableTabViewProps {
  children: React.ReactNode;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  totalTabs: number;
}

export function SwipeableTabView({
  children,
  currentIndex,
  onIndexChange,
  totalTabs,
}: SwipeableTabViewProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, {
      damping: 20,
      stiffness: 90,
    });
  }, [currentIndex]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      const shouldMoveToNext = event.translationX < -SCREEN_WIDTH / 4 && currentIndex < totalTabs - 1;
      const shouldMoveToPrev = event.translationX > SCREEN_WIDTH / 4 && currentIndex > 0;

      if (shouldMoveToNext) {
        runOnJS(onIndexChange)(currentIndex + 1);
      } else if (shouldMoveToPrev) {
        runOnJS(onIndexChange)(currentIndex - 1);
      } else {
        translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, {
          damping: 20,
          stiffness: 90,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 4, // 4 tabs
  },
});
