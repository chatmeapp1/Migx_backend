import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeCustom } from '@/theme/provider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PrivateChatHeader } from '@/components/chatroom/PrivateChatHeader';
import { PrivateChatInput, PrivateChatInputRef } from '@/components/chatroom/PrivateChatInput';
import { EmojiPicker, EMOJI_PICKER_HEIGHT } from '@/components/chatroom/EmojiPicker';
import { ChatRoomContent } from '@/components/chatroom/ChatRoomContent';

export default function PrivateChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useThemeCustom();

  const targetUsername = params.username as string;
  
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const inputRef = useRef<PrivateChatInputRef>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('user_data');
        if (userDataStr) {
          setUserData(JSON.parse(userDataStr));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    
    // Add message to local state for now
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      username: userData?.username || 'You',
      timestamp: new Date().toISOString(),
      isSent: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [userData]);

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
        onBack={() => router.back()}
        onFollowPress={() => Alert.alert('Follow', `Would you like to follow ${targetUsername}?`)}
        onMenuPress={() => Alert.alert('Menu', 'More options coming soon')}
      />

      {/* Messages Container */}
      <View style={styles.messagesContainer}>
        <ChatRoomContent 
          messages={messages} 
          bottomPadding={0}
        />
      </View>

      {/* Emoji Picker */}
      {emojiVisible && (
        <View style={{ height: EMOJI_PICKER_HEIGHT }}>
          <EmojiPicker onEmojiPress={handleEmojiSelect} />
        </View>
      )}

      {/* Input */}
      <View style={{ paddingBottom: insets.bottom }}>
        <PrivateChatInput
          ref={inputRef}
          onSend={handleSendMessage}
          onEmojiPress={handleEmojiPress}
          emojiPickerVisible={emojiVisible}
          emojiPickerHeight={emojiVisible ? EMOJI_PICKER_HEIGHT : 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
});
