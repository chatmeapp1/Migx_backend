
import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'invisible';

interface UsePresenceReturn {
  status: PresenceStatus;
  setStatus: (status: PresenceStatus) => void;
  isConnected: boolean;
}

export function usePresence(userId?: string): UsePresenceReturn {
  const [status, setStatusState] = useState<PresenceStatus>('online');
  const [isConnected, setIsConnected] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-away detection (5 minutes of inactivity)
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (inactiveTime > FIVE_MINUTES && status === 'online') {
        setStatusState('away');
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [lastActivity, status]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground
        setLastActivity(Date.now());
        if (status !== 'busy' && status !== 'invisible') {
          setStatusState('online');
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background
        if (status === 'online') {
          setStatusState('away');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [status]);

  // Socket.io integration would go here
  // For now, this is a placeholder for the socket logic
  useEffect(() => {
    // TODO: Connect to socket.io server
    // const socket = io('YOUR_SOCKET_SERVER_URL');
    
    // socket.on('connect', () => {
    //   setIsConnected(true);
    //   if (userId) {
    //     socket.emit('user:presence', { userId, status });
    //   }
    // });

    // socket.on('disconnect', () => {
    //   setIsConnected(false);
    //   setStatusState('offline');
    // });

    // return () => {
    //   socket.disconnect();
    // };

    // Simulate connection for now
    setIsConnected(true);
  }, [userId]);

  // Emit presence updates
  useEffect(() => {
    if (isConnected && userId) {
      // TODO: Emit to socket.io
      // socket.emit('user:presence', { userId, status });
      console.log('Presence updated:', { userId, status });
    }
  }, [status, isConnected, userId]);

  const setStatus = useCallback((newStatus: PresenceStatus) => {
    setStatusState(newStatus);
    setLastActivity(Date.now());
  }, []);

  return {
    status,
    setStatus,
    isConnected,
  };
}
