
const { getRedisClient } = require('../redis');

const NOTIFICATION_TTL = 86400; // 24 hours

const addNotification = async (username, notification) => {
  try {
    const redis = getRedisClient();
    const key = `notif:${username}`;
    
    await redis.lPush(key, JSON.stringify({
      ...notification,
      timestamp: Date.now(),
      read: false
    }));
    
    await redis.expire(key, NOTIFICATION_TTL);
    return true;
  } catch (error) {
    console.error('Error adding notification:', error);
    return false;
  }
};

const getNotifications = async (username, limit = 50) => {
  try {
    const redis = getRedisClient();
    const key = `notif:${username}`;
    
    const notifications = await redis.lRange(key, 0, limit - 1);
    return notifications.map(n => JSON.parse(n));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

const clearNotifications = async (username) => {
  try {
    const redis = getRedisClient();
    const key = `notif:${username}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

const getUnreadCount = async (username) => {
  try {
    const redis = getRedisClient();
    const key = `notif:${username}`;
    const count = await redis.lLen(key);
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

module.exports = {
  addNotification,
  getNotifications,
  clearNotifications,
  getUnreadCount
};
