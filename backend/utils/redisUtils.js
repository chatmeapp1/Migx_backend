
const { getRedisClient } = require('../redis');

// Presence management
const setPresence = async (username, status) => {
  try {
    const redis = getRedisClient();
    await redis.set(`presence:${username}`, status, 'EX', 86400); // 24 hours expiry
    return true;
  } catch (error) {
    console.error('Error setting presence:', error);
    return false;
  }
};

const getPresence = async (username) => {
  try {
    const redis = getRedisClient();
    const status = await redis.get(`presence:${username}`);
    return status || 'offline';
  } catch (error) {
    console.error('Error getting presence:', error);
    return 'offline';
  }
};

const removePresence = async (username) => {
  try {
    const redis = getRedisClient();
    await redis.del(`presence:${username}`);
    return true;
  } catch (error) {
    console.error('Error removing presence:', error);
    return false;
  }
};

// Session management
const setSession = async (username, socketId) => {
  try {
    const redis = getRedisClient();
    await redis.set(`session:${username}`, socketId, 'EX', 86400); // 24 hours expiry
    return true;
  } catch (error) {
    console.error('Error setting session:', error);
    return false;
  }
};

const getSession = async (username) => {
  try {
    const redis = getRedisClient();
    const socketId = await redis.get(`session:${username}`);
    return socketId;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

const removeSession = async (username) => {
  try {
    const redis = getRedisClient();
    await redis.del(`session:${username}`);
    return true;
  } catch (error) {
    console.error('Error removing session:', error);
    return false;
  }
};

// Room members management
const getRoomMembers = async (roomId) => {
  try {
    const redis = getRedisClient();
    const members = await redis.smembers(`room:${roomId}:members`);
    return members || [];
  } catch (error) {
    console.error('Error getting room members:', error);
    return [];
  }
};

const addRoomMember = async (roomId, username) => {
  try {
    const redis = getRedisClient();
    await redis.sadd(`room:${roomId}:members`, username);
    return true;
  } catch (error) {
    console.error('Error adding room member:', error);
    return false;
  }
};

const removeRoomMember = async (roomId, username) => {
  try {
    const redis = getRedisClient();
    await redis.srem(`room:${roomId}:members`, username);
    return true;
  } catch (error) {
    console.error('Error removing room member:', error);
    return false;
  }
};

module.exports = {
  setPresence,
  getPresence,
  removePresence,
  setSession,
  getSession,
  removeSession,
  getRoomMembers,
  addRoomMember,
  removeRoomMember
};
