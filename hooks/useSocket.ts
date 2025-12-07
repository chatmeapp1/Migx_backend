
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import API_BASE_URL from '@/utils/api';

let socketInstance: Socket | null = null;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      console.log('🔌 Creating new socket connection...');
      socketInstance = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected:', socketInstance?.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return socket;
}
