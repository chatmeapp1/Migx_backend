const { client } = require('../redis');

const ROOM_USERS_KEY = (roomId) => `room:${roomId}:users`;
const ROOM_BANNED_KEY = (roomId) => `room:${roomId}:banned`;
const USER_ROOMS_KEY = (userId) => `user:${userId}:rooms`;
const USER_STATUS_KEY = (userId) => `user:${userId}:status`;
const USER_SOCKET_KEY = (userId) => `user:${userId}:socket`;

// MIG33-style presence keys
const PRESENCE_KEY = (username) => `online:user:${username}`;
const SESSION_KEY = (username) => `session:${username}`;
const ROOM_MEMBERS_KEY = (roomId) => `room:members:${roomId}`;
const ROOM_INFO_KEY = (roomId) => `room:info:${roomId}`;

const addUserToRoom = async (roomId, userId, username) => {
  try {
    const userData = JSON.stringify({ id: userId, username, joinedAt: Date.now() });
    await client.sAdd(ROOM_USERS_KEY(roomId), userData);
    await client.sAdd(USER_ROOMS_KEY(userId), roomId.toString());
    return true;
  } catch (error) {
    console.error('Error adding user to room:', error);
    return false;
  }
};

const removeUserFromRoom = async (roomId, userId, username) => {
  try {
    const members = await client.sMembers(ROOM_USERS_KEY(roomId));
    for (const member of members) {
      const data = JSON.parse(member);
      if (data.id == userId || data.username === username) {
        await client.sRem(ROOM_USERS_KEY(roomId), member);
        break;
      }
    }
    await client.sRem(USER_ROOMS_KEY(userId), roomId.toString());
    return true;
  } catch (error) {
    console.error('Error removing user from room:', error);
    return false;
  }
};

const getRoomUsers = async (roomId) => {
  try {
    const members = await client.sMembers(ROOM_USERS_KEY(roomId));
    return members.map((m) => {
      try {
        return JSON.parse(m);
      } catch {
        return { username: m };
      }
    });
  } catch (error) {
    console.error('Error getting room users:', error);
    return [];
  }
};

const getRoomUserCount = async (roomId) => {
  try {
    return await client.sCard(ROOM_USERS_KEY(roomId));
  } catch (error) {
    console.error('Error getting room user count:', error);
    return 0;
  }
};

const getUserRooms = async (userId) => {
  try {
    return await client.sMembers(USER_ROOMS_KEY(userId));
  } catch (error) {
    console.error('Error getting user rooms:', error);
    return [];
  }
};

const banUser = async (roomId, userId, username) => {
  try {
    const banData = JSON.stringify({ id: userId, username, bannedAt: Date.now() });
    await client.sAdd(ROOM_BANNED_KEY(roomId), banData);
    await removeUserFromRoom(roomId, userId, username);
    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    return false;
  }
};

const unbanUser = async (roomId, userId, username) => {
  try {
    const members = await client.sMembers(ROOM_BANNED_KEY(roomId));
    for (const member of members) {
      const data = JSON.parse(member);
      if (data.id == userId || data.username === username) {
        await client.sRem(ROOM_BANNED_KEY(roomId), member);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
};

const isBanned = async (roomId, userId, username) => {
  try {
    const members = await client.sMembers(ROOM_BANNED_KEY(roomId));
    for (const member of members) {
      const data = JSON.parse(member);
      if (data.id == userId || data.username === username) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking ban status:', error);
    return false;
  }
};

const getBannedUsers = async (roomId) => {
  try {
    const members = await client.sMembers(ROOM_BANNED_KEY(roomId));
    return members.map((m) => {
      try {
        return JSON.parse(m);
      } catch {
        return { username: m };
      }
    });
  } catch (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
};

const setUserStatus = async (userId, status) => {
  try {
    await client.set(USER_STATUS_KEY(userId), status);
    await client.expire(USER_STATUS_KEY(userId), 300);
    return true;
  } catch (error) {
    console.error('Error setting user status:', error);
    return false;
  }
};

const getUserStatus = async (userId) => {
  try {
    return (await client.get(USER_STATUS_KEY(userId))) || 'offline';
  } catch (error) {
    console.error('Error getting user status:', error);
    return 'offline';
  }
};

const setUserSocket = async (userId, socketId) => {
  try {
    await client.set(USER_SOCKET_KEY(userId), socketId);
    await client.expire(USER_SOCKET_KEY(userId), 3600);
    return true;
  } catch (error) {
    console.error('Error setting user socket:', error);
    return false;
  }
};

const getUserSocket = async (userId) => {
  try {
    return await client.get(USER_SOCKET_KEY(userId));
  } catch (error) {
    console.error('Error getting user socket:', error);
    return null;
  }
};

const removeUserSocket = async (userId) => {
  try {
    await client.del(USER_SOCKET_KEY(userId));
    return true;
  } catch (error) {
    console.error('Error removing user socket:', error);
    return false;
  }
};

const clearRoomUsers = async (roomId) => {
  try {
    await client.del(ROOM_USERS_KEY(roomId));
    return true;
  } catch (error) {
    console.error('Error clearing room users:', error);
    return false;
  }
};

// MIG33-style Presence Management
const setPresence = async (username, status) => {
  try {
    // status: online | away | busy | offline
    await client.set(PRESENCE_KEY(username), status);
    await client.expire(PRESENCE_KEY(username), 120); // 2 minutes TTL
    return true;
  } catch (error) {
    console.error('Error setting presence:', error);
    return false;
  }
};

const getPresence = async (username) => {
  try {
    const presence = await client.get(PRESENCE_KEY(username));
    return presence || 'offline';
  } catch (error) {
    console.error('Error getting presence:', error);
    return 'offline';
  }
};

const removePresence = async (username) => {
  try {
    await client.del(PRESENCE_KEY(username));
    return true;
  } catch (error) {
    console.error('Error removing presence:', error);
    return false;
  }
};

// Session Management - Prevent Double Login
const setSession = async (username, socketId) => {
  try {
    const existingSession = await client.get(SESSION_KEY(username));
    if (existingSession && existingSession !== socketId) {
      // User already logged in from another device
      return { success: false, existingSocketId: existingSession };
    }
    await client.set(SESSION_KEY(username), socketId);
    await client.expire(SESSION_KEY(username), 3600); // 1 hour
    return { success: true };
  } catch (error) {
    console.error('Error setting session:', error);
    return { success: false, error: 'Failed to set session' };
  }
};

const getSession = async (username) => {
  try {
    return await client.get(SESSION_KEY(username));
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

const removeSession = async (username) => {
  try {
    await client.del(SESSION_KEY(username));
    return true;
  } catch (error) {
    console.error('Error removing session:', error);
    return false;
  }
};

// Room Members Management (Real-time)
const addMemberToRoom = async (roomId, username) => {
  try {
    await client.sAdd(ROOM_MEMBERS_KEY(roomId), username);
    return true;
  } catch (error) {
    console.error('Error adding member to room:', error);
    return false;
  }
};

const removeMemberFromRoom = async (roomId, username) => {
  try {
    await client.sRem(ROOM_MEMBERS_KEY(roomId), username);
    return true;
  } catch (error) {
    console.error('Error removing member from room:', error);
    return false;
  }
};

const getRoomMembers = async (roomId) => {
  try {
    return await client.sMembers(ROOM_MEMBERS_KEY(roomId));
  } catch (error) {
    console.error('Error getting room members:', error);
    return [];
  }
};

const getRoomMemberCount = async (roomId) => {
  try {
    return await client.sCard(ROOM_MEMBERS_KEY(roomId));
  } catch (error) {
    console.error('Error getting room member count:', error);
    return 0;
  }
};

const isMemberInRoom = async (roomId, username) => {
  try {
    return await client.sIsMember(ROOM_MEMBERS_KEY(roomId), username);
  } catch (error) {
    console.error('Error checking member in room:', error);
    return false;
  }
};

// Room State Caching
const setRoomInfo = async (roomId, roomData) => {
  try {
    await client.set(ROOM_INFO_KEY(roomId), JSON.stringify(roomData));
    await client.expire(ROOM_INFO_KEY(roomId), 300); // 5 minutes cache
    return true;
  } catch (error) {
    console.error('Error setting room info:', error);
    return false;
  }
};

const getRoomInfo = async (roomId) => {
  try {
    const data = await client.get(ROOM_INFO_KEY(roomId));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting room info:', error);
    return null;
  }
};

const removeRoomInfo = async (roomId) => {
  try {
    await client.del(ROOM_INFO_KEY(roomId));
    return true;
  } catch (error) {
    console.error('Error removing room info:', error);
    return false;
  }
};

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers,
  getRoomUserCount,
  getUserRooms,
  banUser,
  unbanUser,
  isBanned,
  getBannedUsers,
  setUserStatus,
  getUserStatus,
  setUserSocket,
  getUserSocket,
  removeUserSocket,
  clearRoomUsers,
  // MIG33-style presence
  setPresence,
  getPresence,
  removePresence,
  // Session management
  setSession,
  getSession,
  removeSession,
  // Room members
  addMemberToRoom,
  removeMemberFromRoom,
  getRoomMembers,
  getRoomMemberCount,
  isMemberInRoom,
  // Room info cache
  setRoomInfo,
  getRoomInfo,
  removeRoomInfo
};
