import React, { useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  ListRenderItemInfo,
} from 'react-native';
import { useRoomTabsStore, useOpenRooms, useActiveIndex, OpenRoom } from '@/stores/useRoomTabsStore';
import { ChatRoomInstance } from './ChatRoomInstance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChatRoomTabsProps {
  bottomPadding?: number;
  renderVoteButton?: () => React.ReactNode;
}

export function ChatRoomTabs({
  bottomPadding = 70,
  renderVoteButton,
}: ChatRoomTabsProps) {
  const openRooms = useOpenRooms();
  const activeIndex = useActiveIndex();
  const setActiveRoom = useRoomTabsStore(state => state.setActiveRoom);
  const activeRoomId = useRoomTabsStore(state => state.activeRoomId);
  
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);
  const lastActiveIndex = useRef(activeIndex);
  
  const scrollToIndex = useCallback((index: number) => {
    if (flatListRef.current && index >= 0 && index < openRooms.length) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
        });
      } catch (e) {
        console.log('scrollToIndex error:', e);
      }
    }
  }, [openRooms.length]);
  
  React.useEffect(() => {
    if (activeIndex !== lastActiveIndex.current && !isScrolling.current) {
      scrollToIndex(activeIndex);
      lastActiveIndex.current = activeIndex;
    }
  }, [activeIndex, scrollToIndex]);
  
  const handleMomentumScrollEnd = useCallback((
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    isScrolling.current = false;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < openRooms.length) {
      lastActiveIndex.current = newIndex;
      const targetRoom = openRooms[newIndex];
      if (targetRoom) {
        setActiveRoom(targetRoom.roomId);
      }
    }
  }, [activeIndex, openRooms, setActiveRoom]);
  
  const handleScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
  }, []);
  
  const renderRoomItem = useCallback(({ item }: ListRenderItemInfo<OpenRoom>) => {
    return (
      <ChatRoomInstance
        roomId={item.roomId}
        roomName={item.name}
        bottomPadding={bottomPadding}
        isActive={item.roomId === activeRoomId}
        renderVoteButton={renderVoteButton}
      />
    );
  }, [bottomPadding, activeRoomId, renderVoteButton]);
  
  const keyExtractor = useCallback((item: OpenRoom) => item.roomId, []);
  
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  }), []);
  
  const flatListStyle = useMemo(() => [styles.flatList], []);
  
  if (openRooms.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={openRooms}
        renderItem={renderRoomItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        getItemLayout={getItemLayout}
        initialScrollIndex={openRooms.length > 0 ? Math.min(Math.max(0, activeIndex), openRooms.length - 1) : 0}
        removeClippedSubviews={false}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        style={flatListStyle}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
});
