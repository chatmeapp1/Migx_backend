import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useRoomMessagesData } from '@/stores/useRoomTabsStore';
import { ChatRoomContent } from './ChatRoomContent';
import { PrivateChatHeader } from './PrivateChatHeader';
import { PrivateChatInput, PrivateChatInputRef } from './PrivateChatInput';
import { EmojiPicker, EMOJI_PICKER_HEIGHT } from './EmojiPicker';
import { useThemeCustom } from '@/theme/provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoomTabsStore } from '@/stores/useRoomTabsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PrivateChatInstanceProps {
  roomId: string;
  targetUsername: string;
  targetUserId?: string;
  bottomPadding: number;
  isActive: boolean;
}

export const PrivateChatInstance = React.memo(function PrivateChatInstance({
  roomId,
  targetUsername,
  targetUserId,
  bottomPadding,
  isActive,
}: PrivateChatInstanceProps) {
  const messagesData = useRoomMessagesData(roomId);
  const messages = useMemo(() => messagesData || [], [messagesData]);
  const { theme } = useThemeCustom();
  const insets = useSafeAreaInsets();
  const inputRef = React.useRef<PrivateChatInputRef>(null);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const addMessage = useRoomTabsStore((state) => state.addMessage);

  const handleSendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      username: 'You',
      message: message.trim(),
      isOwnMessage: true,
      timestamp: new Date().toISOString(),
    };
    
    addMessage(roomId, newMessage);
  }, [roomId, addMessage]);

  const handleEmojiPress = useCallback(() => {
    setEmojiVisible(!emojiVisible);
  }, [emojiVisible]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    inputRef.current?.insertEmoji(emoji);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a5229" />
      
      {/* Header */}
      <PrivateChatHeader 
        username={targetUsername}
        targetUserId={targetUserId}
        onFollowPress={() => {}}
        onMenuPress={() => {}}
      />

      {/* Messages - flex: 1 to take remaining space */}
      <View style={styles.messagesContainer}>
        <ChatRoomContent 
          messages={messages} 
          bottomPadding={0}
        />
      </View>

      {/* Input - At the bottom */}
      <PrivateChatInput
        ref={inputRef}
        onSend={handleSendMessage}
        onEmojiPress={handleEmojiPress}
        emojiPickerVisible={emojiVisible}
        emojiPickerHeight={emojiVisible ? EMOJI_PICKER_HEIGHT : 0}
      />

      {/* Emoji Picker - Below input, inline mode */}
      {emojiVisible && (
        <EmojiPicker 
          visible={emojiVisible}
          onClose={() => setEmojiVisible(false)}
          onEmojiSelect={handleEmojiSelect}
          inline={true}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
});
