import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import API_BASE_URL from '@/utils/api';

let socketInstance: Socket | null = null;

/**
 * ⚠️ WARNING: DO NOT USE THIS HOOK IN FEED, PROFILE, OR OTHER NON-CHAT SCREENS
 * 
 * This hook should ONLY be used in:
 * - app/chatroom/[id].tsx (chat room screen)
 * - Chat-related components
 * 
 * For feed and other screens, use REST API (fetch/axios) instead!
 */
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (socketInstance) {
      console.log('♻️ Reusing existing socket connection:', socketInstance.id);
      return;
    }

    console.log('🔧 Creating Socket.IO connection...');
    console.log('API_BASE_URL:', API_BASE_URL);

    console.log('🔌 Initializing new Socket.IO connection...');
    const newSocket = io(`${API_BASE_URL}/chat`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketInstance = newSocket;

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, keep connection alive for chat
    };
  }, []);

  return socket;
}