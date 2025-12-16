import { useEffect, useRef, useCallback } from 'react';
import { useRoomTabsStore, Message } from '@/stores/useRoomTabsStore';

interface UseRoomSocketOptions {
  roomId: string;
  onRoomJoined?: (data: any) => void;
  onUsersUpdated?: (users: string[]) => void;
}

export function useRoomSocket({ roomId, onRoomJoined, onUsersUpdated }: UseRoomSocketOptions) {
  const socket = useRoomTabsStore(state => state.socket);
  const currentUsername = useRoomTabsStore(state => state.currentUsername);
  const currentUserId = useRoomTabsStore(state => state.currentUserId);
  const addMessage = useRoomTabsStore(state => state.addMessage);
  const updateRoomName = useRoomTabsStore(state => state.updateRoomName);
  const markRoomJoined = useRoomTabsStore(state => state.markRoomJoined);
  const markRoomLeft = useRoomTabsStore(state => state.markRoomLeft);
  const isRoomJoined = useRoomTabsStore(state => state.isRoomJoined);
  const injectSystemMessage = useRoomTabsStore(state => state.injectSystemMessage);
  const hasSystemMessage = useRoomTabsStore(state => state.hasSystemMessage);
  
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;
  
  const handleSystemMessage = useCallback((data: { roomId: string; message: string; type: string }) => {
    if (data.roomId !== roomIdRef.current) return;
    
    console.log("MESSAGE RECEIVE", data.roomId, data.message);
    
    const newMessage: Message = {
      id: `sys-${Date.now()}-${Math.random()}`,
      username: 'System',
      message: data.message,
      isSystem: true,
    };
    addMessage(data.roomId, newMessage);
  }, [addMessage]);

  const handleChatMessage = useCallback((data: any) => {
    const targetRoomId = data.roomId || roomIdRef.current;
    if (targetRoomId !== roomIdRef.current) return;
    
    console.log("MESSAGE RECEIVE", targetRoomId, data.message);
    
    const cmdTypes = ['cmd', 'cmdMe', 'cmdRoll', 'cmdGift'];
    const isCommandMessage = cmdTypes.includes(data.messageType) || cmdTypes.includes(data.type);
    
    const newMessage: Message = {
      id: data.id || `msg-${Date.now()}-${Math.random()}`,
      username: data.username,
      message: data.message,
      isOwnMessage: data.username === currentUsername,
      isSystem: data.messageType === 'system' || data.type === 'system',
      isNotice: data.messageType === 'notice',
      isCmd: isCommandMessage,
      timestamp: data.timestamp,
    };
    
    addMessage(targetRoomId, newMessage);
  }, [addMessage, currentUsername]);

  const handleRoomJoined = useCallback((data: any) => {
    const joinedRoomId = data.roomId || roomIdRef.current;
    if (joinedRoomId !== roomIdRef.current) return;
    
    const roomName = data.room?.name || 'Chat Room';
    const admin = data.room?.creator_name || data.room?.owner_name || 'admin';
    
    if (data.room?.name) {
      updateRoomName(joinedRoomId, data.room.name);
    }
    
    const usernames = data.users 
      ? data.users.map((u: any) => u.username || u)
      : data.currentUsers || [];
    
    if (!hasSystemMessage(joinedRoomId)) {
      injectSystemMessage(joinedRoomId, roomName, admin, usernames);
    }
    
    if (onRoomJoined) {
      onRoomJoined(data);
    }
    
    if (onUsersUpdated) {
      onUsersUpdated(usernames);
    }
  }, [updateRoomName, onRoomJoined, onUsersUpdated, hasSystemMessage, injectSystemMessage]);

  const handleRoomUsers = useCallback((data: { roomId: string; users: any[]; count: number }) => {
    if (data.roomId !== roomIdRef.current) return;
    
    const usernames = data.users.map((u: any) => u.username || u);
    if (onUsersUpdated) {
      onUsersUpdated(usernames);
    }
  }, [onUsersUpdated]);

  const handleUserJoined = useCallback((data: { roomId: string; user: any; users: any[] }) => {
    if (data.roomId !== roomIdRef.current) return;
    
    const usernames = data.users.map((u: any) => u.username || u);
    if (onUsersUpdated) {
      onUsersUpdated(usernames);
    }
  }, [onUsersUpdated]);

  const handleUserLeft = useCallback((data: { roomId: string; username: string; users: any[] }) => {
    if (data.roomId !== roomIdRef.current) return;
    
    const usernames = Array.isArray(data.users) 
      ? data.users.map((u: any) => typeof u === 'string' ? u : u.username)
      : [];
    if (onUsersUpdated) {
      onUsersUpdated(usernames);
    }
  }, [onUsersUpdated]);

  useEffect(() => {
    if (!socket || !currentUsername || !currentUserId || !roomId) {
      return;
    }

    console.log(`🔌 [Room ${roomId}] Registering socket listeners`);

    const boundHandleSystemMessage = handleSystemMessage;
    const boundHandleChatMessage = handleChatMessage;
    const boundHandleRoomJoined = handleRoomJoined;
    const boundHandleRoomUsers = handleRoomUsers;
    const boundHandleUserJoined = handleUserJoined;
    const boundHandleUserLeft = handleUserLeft;

    socket.on('system:message', boundHandleSystemMessage);
    socket.on('chat:message', boundHandleChatMessage);
    socket.on('room:joined', boundHandleRoomJoined);
    socket.on('room:users', boundHandleRoomUsers);
    socket.on('room:user:joined', boundHandleUserJoined);
    socket.on('room:user:left', boundHandleUserLeft);

    if (!isRoomJoined(roomId)) {
      console.log(`📤 [Room ${roomId}] Joining room`);
      socket.emit('join_room', { 
        roomId, 
        userId: currentUserId, 
        username: currentUsername 
      });
      markRoomJoined(roomId);
      
      setTimeout(() => {
        socket.emit('room:users:get', { roomId });
      }, 500);
    }

    return () => {
      console.log(`🔌 [Room ${roomId}] Cleaning up socket listeners`);
      
      socket.off('system:message', boundHandleSystemMessage);
      socket.off('chat:message', boundHandleChatMessage);
      socket.off('room:joined', boundHandleRoomJoined);
      socket.off('room:users', boundHandleRoomUsers);
      socket.off('room:user:joined', boundHandleUserJoined);
      socket.off('room:user:left', boundHandleUserLeft);
    };
  }, [socket, currentUsername, currentUserId, roomId, isRoomJoined, markRoomJoined, handleSystemMessage, handleChatMessage, handleRoomJoined, handleRoomUsers, handleUserJoined, handleUserLeft]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !message.trim() || !currentUserId) return;
    
    console.log("MESSAGE SEND", roomId, message.trim());
    socket.emit('chat:message', {
      roomId,
      userId: currentUserId,
      username: currentUsername,
      message: message.trim(),
    });
  }, [socket, currentUserId, currentUsername, roomId]);

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    
    console.log(`🚪 [Room ${roomId}] Leaving room`);
    socket.emit('leave_room', { 
      roomId, 
      username: currentUsername, 
      userId: currentUserId 
    });
    markRoomLeft(roomId);
  }, [socket, roomId, currentUsername, currentUserId, markRoomLeft]);

  return {
    sendMessage,
    leaveRoom,
    isConnected: socket?.connected || false,
  };
}
