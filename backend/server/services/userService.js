const { query } = require('../../db/db');
const { setUserStatus, getUserStatus, setUserSocket, removeUserSocket } = require('../utils/presence');

const createUser = async (username, password = null, email = null) => {
  try {
    const result = await query(
      `INSERT INTO users (username, password, email)
       VALUES ($1, $2, $3)
       RETURNING id, username, credits, role, status, created_at`,
      [username, password, email]
    );
    
    await query(
      'INSERT INTO user_levels (user_id, xp, level) VALUES ($1, 0, 1)',
      [result.rows[0].id]
    );
    
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      return { error: 'Username already exists' };
    }
    console.error('Error creating user:', error);
    return null;
  }
};

const getUserByUsername = async (username) => {
  try {
    const result = await query(
      `SELECT u.*, ul.xp, ul.level 
       FROM users u
       LEFT JOIN user_levels ul ON u.id = ul.user_id
       WHERE u.username = $1`,
      [username]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

const getUserById = async (userId) => {
  try {
    const result = await query(
      `SELECT u.*, ul.xp, ul.level 
       FROM users u
       LEFT JOIN user_levels ul ON u.id = ul.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

const updateUserCredits = async (userId, amount) => {
  try {
    const result = await query(
      `UPDATE users SET credits = credits + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, credits`,
      [amount, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user credits:', error);
    return null;
  }
};

const setCredits = async (userId, credits) => {
  try {
    const result = await query(
      `UPDATE users SET credits = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, credits`,
      [credits, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error setting user credits:', error);
    return null;
  }
};

const getUserCredits = async (userId) => {
  try {
    const result = await query(
      'SELECT credits FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
};

const updateUserRole = async (userId, role) => {
  try {
    const validRoles = ['user', 'mentor', 'merchant', 'admin'];
    if (!validRoles.includes(role)) {
      return { error: 'Invalid role' };
    }
    
    const result = await query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, role`,
      [role, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};

const getUserRole = async (userId) => {
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

const isAdmin = async (userId) => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

const isMentor = async (userId) => {
  const role = await getUserRole(userId);
  return role === 'mentor' || role === 'admin';
};

const isMerchant = async (userId) => {
  const role = await getUserRole(userId);
  return role === 'merchant';
};

const updateUserStatus = async (userId, status) => {
  try {
    await setUserStatus(userId, status);
    await query(
      `UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, userId]
    );
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
};

const connectUser = async (userId, socketId) => {
  try {
    await setUserSocket(userId, socketId);
    await updateUserStatus(userId, 'online');
    return true;
  } catch (error) {
    console.error('Error connecting user:', error);
    return false;
  }
};

const disconnectUser = async (userId) => {
  try {
    await removeUserSocket(userId);
    await updateUserStatus(userId, 'offline');
    return true;
  } catch (error) {
    console.error('Error disconnecting user:', error);
    return false;
  }
};

const searchUsers = async (searchTerm, limit = 20) => {
  try {
    const result = await query(
      `SELECT id, username, avatar, role, status 
       FROM users 
       WHERE username ILIKE $1
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

const getOnlineUsers = async (limit = 50) => {
  try {
    const result = await query(
      `SELECT id, username, avatar, role, status 
       FROM users 
       WHERE status = 'online'
       ORDER BY username
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  updateUserCredits,
  setCredits,
  getUserCredits,
  updateUserRole,
  getUserRole,
  isAdmin,
  isMentor,
  isMerchant,
  updateUserStatus,
  connectUser,
  disconnectUser,
  searchUsers,
  getOnlineUsers
};
