
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface TabSwipeViewProps {
  children: React.ReactNode;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  totalTabs: number;
}

export function TabSwipeView({
  children,
  currentIndex,
  onIndexChange,
  totalTabs,
}: TabSwipeViewProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, {
      damping: 25,
      stiffness: 100,
      mass: 0.5,
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
      const shouldMoveToNext = event.translationX < -SCREEN_WIDTH / 5 && currentIndex < totalTabs - 1;
      const shouldMoveToPrev = event.translationX > SCREEN_WIDTH / 5 && currentIndex > 0;

      if (shouldMoveToNext) {
        runOnJS(onIndexChange)(currentIndex + 1);
      } else if (shouldMoveToPrev) {
        runOnJS(onIndexChange)(currentIndex - 1);
      } else {
        translateX.value = withSpring(-currentIndex * SCREEN_WIDTH, {
          damping: 25,
          stiffness: 100,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalTabs }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#007AFF',
  },
});
