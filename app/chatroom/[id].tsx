
import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeCustom } from '@/theme/provider';
import { ChatRoomHeader } from '@/components/chatroom/ChatRoomHeader';
import { ChatRoomContent } from '@/components/chatroom/ChatRoomContent';
import { ChatRoomInput } from '@/components/chatroom/ChatRoomInput';

interface ChatTab {
  id: string;
  name: string;
  type: 'room' | 'private';
  messages: any[];
}

export default function ChatRoomScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useThemeCustom();
  const roomId = params.id as string;
  const roomName = params.name as string || 'Mobile fun';

  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: roomId,
      name: roomName,
      type: 'room',
      messages: [
        {
          id: '1',
          username: 'Indonesia',
          message: 'Welcome to Indonesia...',
          timestamp: '',
          isSystem: true,
        },
        {
          id: '2',
          username: 'Indonesia',
          message: 'Currently users in the room: migx, mad',
          timestamp: '',
          isSystem: true,
        },
        {
          id: '3',
          username: 'Indonesia',
          message: 'This room created by migx',
          timestamp: '',
          isSystem: true,
        },
        {
          id: '4',
          username: 'Indonesia',
          message: 'migx [1] has entered',
          timestamp: '',
          isSystem: true,
        },
        {
          id: '5',
          username: '',
          message: '🔊 <<Welcome Migx communty happy fun!!>>',
          timestamp: '',
          isNotice: true,
        },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState(roomId);

  const handleSendMessage = (message: string) => {
    const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentTabIndex !== -1) {
      const newMessage = {
        id: Date.now().toString(),
        username: 'migx',
        message,
        timestamp: '',
        userType: 'normal' as const,
        isOwnMessage: true,
      };

      const updatedTabs = [...tabs];
      updatedTabs[currentTabIndex].messages = [
        ...updatedTabs[currentTabIndex].messages,
        newMessage,
      ];
      setTabs(updatedTabs);
    }
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length === 1) {
      router.back();
      return;
    }

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ChatRoomHeader
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCloseTab={handleCloseTab}
      />
      {currentTab && (
        <>
          <ChatRoomContent messages={currentTab.messages} />
          <ChatRoomInput onSend={handleSendMessage} />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
