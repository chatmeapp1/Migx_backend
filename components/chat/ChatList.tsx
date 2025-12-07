
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useThemeCustom } from '@/theme/provider';
import { ChatItem } from './ChatItem';
import API_BASE_URL from '@/utils/api';
import { useSocket } from '@/hooks/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatData {
  type: 'user' | 'room';
  name: string;
  message?: string;
  time?: string;
  isOnline?: boolean;
  tags?: string[];
  username?: string;
  roomId?: string;
}

export function ChatList() {
  const { theme } = useThemeCustom();
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const socket = useSocket();

  useEffect(() => {
    loadUsername();
  }, []);

  useEffect(() => {
    if (username) {
      fetchChatList();
      
      // Listen for real-time updates
      if (socket) {
        socket.on('chatlist:update', handleChatListUpdate);
        socket.emit('chatlist:get', { username });
      }
    }

    return () => {
      if (socket) {
        socket.off('chatlist:update', handleChatListUpdate);
      }
    };
  }, [username, socket]);

  const loadUsername = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error('Error loading username:', error);
    }
  };

  const fetchChatList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/list?username=${username}`);
      const data = await response.json();
      
      if (data.success) {
        const formattedData: ChatData[] = [];
        
        // Add rooms
        data.rooms?.forEach((room: any) => {
          formattedData.push({
            type: 'room',
            name: room.name,
            roomId: room.id,
            message: room.lastMessage?.message 
              ? `${room.lastMessage.username}: ${room.lastMessage.message}` 
              : undefined,
            time: room.lastMessage?.timestamp 
              ? formatTime(room.lastMessage.timestamp) 
              : undefined,
          });
        });
        
        // Add DMs
        data.dms?.forEach((dm: any) => {
          formattedData.push({
            type: 'user',
            name: dm.username,
            username: dm.username,
            message: dm.lastMessage?.message 
              ? `${dm.lastMessage.fromUsername}: ${dm.lastMessage.message}` 
              : undefined,
            time: dm.lastMessage?.timestamp 
              ? formatTime(dm.lastMessage.timestamp) 
              : undefined,
            isOnline: dm.isOnline || false,
          });
        });
        
        setChatData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching chat list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatListUpdate = (data: any) => {
    console.log('Chat list update received:', data);
    fetchChatList(); // Refresh the list
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.secondary }]}>Loading chats...</Text>
        </View>
      </View>
    );
  }

  if (chatData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.secondary }]}>
            No chats yet. Join a room or start a conversation!
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {chatData.map((chat, index) => (
          <ChatItem key={`${chat.type}-${chat.name}-${index}`} {...chat} />
        ))}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  spacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
