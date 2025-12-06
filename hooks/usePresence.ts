
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

  // Socket.io integration
  useEffect(() => {
    if (!userId) return;

    // Import socket from your socket service
    // This is a placeholder - adjust based on your actual socket implementation
    const updatePresenceOnServer = async () => {
      try {
        // Emit presence update to server
        // socket.emit('presence:update', { username: userId, status });
        console.log('Presence updated:', { userId, status });
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    updatePresenceOnServer();
    setIsConnected(true);

    // Keep-alive: refresh presence every 90 seconds (before 2 min TTL expires)
    const keepAliveInterval = setInterval(() => {
      if (status !== 'offline') {
        updatePresenceOnServer();
      }
    }, 90000);

    return () => {
      clearInterval(keepAliveInterval);
    };
  }, [userId, status]);

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
