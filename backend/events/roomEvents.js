const roomService = require('../services/roomService');
const userService = require('../services/userService');
const banService = require('../services/banService');
const { addXp, XP_REWARDS } = require('../utils/xpLeveling');
const { getPresence } = require('../utils/presence');
const {
  addUserRoom,
  removeUserRoom,
  addRecentRoom,
  incrementRoomActive,
  decrementRoomActive
} = require('../utils/redisUtils');
const {
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers: getRoomPresenceUsers,
  getRoomUserCount,
  addSystemMessage
} = require('../utils/redisPresence');

// Helper function to create system messages
const createSystemMessage = (roomId, message) => ({
  roomId,
  message,
  timestamp: new Date().toISOString(),
  type: 'system'
});

const disconnectTimers = new Map();

module.exports = (io, socket) => {
  const joinRoom = async (data) => {
    try {
      const { roomId, userId, username } = data;

      console.log(`👤 User joining room:`, { roomId, userId, username });

      // Clear any pending disconnect timer for this user
      const timerKey = `${userId}-${roomId}`;
      if (disconnectTimers.has(timerKey)) {
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
        console.log(`✅ Reconnected within 15s - keeping user in room:`, username);
      }

      if (!roomId || !userId || !username) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Check if user is banned (skip ban check for now as banService needs to be fixed)
      try {
        const roomService = require('../services/roomService');
        const banned = await roomService.isUserBanned(roomId, userId, username);
        if (banned) {
          socket.emit('system:message', {
            roomId,
            message: 'You are banned from this room',
            timestamp: new Date().toISOString(),
            type: 'error'
          });
          return;
        }
      } catch (err) {
        console.log('Ban check skipped:', err.message);
      }

      const room = await roomService.getRoomById(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Check room capacity using Redis presence
      const currentUserCount = await getRoomUserCount(roomId);
      if (currentUserCount >= room.max_users) {
        socket.emit('system:message', {
          roomId,
          message: 'Room is full',
          timestamp: new Date().toISOString(),
          type: 'error'
        });
        return;
      }

      socket.join(`room:${roomId}`);
      socket.join(`user:${username}`);

      await addUserRoom(username, roomId, room.name);

      // Get current users before adding new user
      const currentUsersList = await getRoomPresenceUsers(roomId);

      // Add user to Redis presence
      await addUserToRoom(roomId, username);

      // Get updated count after adding user
      const newUserCount = await getRoomUserCount(roomId);

      const user = await userService.getUserById(userId);
      const userWithPresence = {
        ...user,
        presence: await getPresence(username)
      };

      // Get all users from database
      const updatedUsers = await roomService.getRoomUsers(roomId);
      const usersWithPresence = await Promise.all(
        updatedUsers.map(async (u) => ({
          ...u,
          presence: await getPresence(u.username)
        }))
      );

      // Create user list string for welcome message
      const userListString = currentUsersList.length > 0
        ? currentUsersList.join(', ')
        : username;

      // MIG33-style welcome messages - send to the joining user only
      const welcomeMsg1 = `Welcome to ${room.name}...`;
      const welcomeMsg2 = `Currently users in the room: ${userListString}`;
      const welcomeMsg3 = `This room is managed by ${room.owner_name || room.creator_name || 'admin'}`;

      // Send welcome messages immediately
      socket.emit('chat:message', {
        id: Date.now().toString() + '-1',
        roomId,
        username: room.name,
        message: welcomeMsg1,
        timestamp: new Date().toISOString(),
        type: 'system',
        messageType: 'system'
      });

      setTimeout(() => {
        socket.emit('chat:message', {
          id: Date.now().toString() + '-2',
          roomId,
          username: room.name,
          message: welcomeMsg2,
          timestamp: new Date().toISOString(),
          type: 'system',
          messageType: 'system'
        });
      }, 100);

      setTimeout(() => {
        socket.emit('chat:message', {
          id: Date.now().toString() + '-3',
          roomId,
          username: room.name,
          message: welcomeMsg3,
          timestamp: new Date().toISOString(),
          type: 'system',
          messageType: 'system'
        });
      }, 200);

      // Save to Redis
      await addSystemMessage(roomId, `${room.name} : ${welcomeMsg1}`);
      await addSystemMessage(roomId, `${room.name} : ${welcomeMsg2}`);
      await addSystemMessage(roomId, `${room.name} : ${welcomeMsg3}`);

      // MIG33-style enter message to all users in room
      const enterMsg = `${username} [${newUserCount}] has entered`;
      const enterMessage = {
        roomId,
        username: room.name,
        message: enterMsg,
        timestamp: new Date().toISOString(),
        type: 'system',
        messageType: 'system'
      };

      io.to(`room:${roomId}`).emit('chat:message', enterMessage);

      // Save enter message to Redis
      await addSystemMessage(roomId, `${room.name} : ${enterMsg}`);

      io.to(`room:${roomId}`).emit('room:user:joined', {
        roomId,
        user: userWithPresence,
        users: usersWithPresence
      });

      console.log('📤 Sending room:joined event:', {
        roomId,
        roomName: room.name,
        description: room.description,
        userCount: newUserCount,
        username
      });

      socket.emit('room:joined', {
        roomId,
        room,
        users: usersWithPresence,
        currentUsers: await getRoomPresenceUsers(roomId),
        userCount: newUserCount
      });

      socket.emit('chatlist:roomJoined', {
        roomId,
        roomName: room.name
      });

      await addXp(userId, XP_REWARDS.JOIN_ROOM, 'join_room', io);

      await addRecentRoom(username, roomId, room.name);
      await incrementRoomActive(roomId);

      io.emit('rooms:updateCount', {
        roomId,
        userCount: newUserCount,
        maxUsers: room.max_users
      });

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  };

  const leaveRoom = async (data) => {
    try {
      const { roomId, username } = data;

      if (!roomId || !username) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      socket.leave(`room:${roomId}`);
      await removeUserRoom(username, roomId);

      // Remove user from Redis presence
      await removeUserFromRoom(roomId, username);

      // Get updated count after removing user
      const userCount = await getRoomUserCount(roomId);

      const updatedUsers = await roomService.getRoomUsers(roomId);
      const usersWithPresence = await Promise.all(
        updatedUsers.map(async (u) => ({
          ...u,
          presence: await getPresence(u.username)
        }))
      );

      // MIG33-style left message: "Indonesia : migtes4 [1] has left"
      const room = await roomService.getRoomById(roomId);
      const leftMsg = `${username} [${userCount}] has left`;
      const leftMessage = {
        roomId,
        username: room.name,
        message: leftMsg,
        timestamp: new Date().toISOString(),
        type: 'system',
        messageType: 'system'
      };

      io.to(`room:${roomId}`).emit('chat:message', leftMessage);

      // Save left message to Redis
      await addSystemMessage(roomId, `${room.name} : ${leftMsg}`);

      io.to(`room:${roomId}`).emit('room:user:left', {
        roomId,
        username,
        users: usersWithPresence
      });

      socket.emit('room:left', { roomId });
      socket.emit('chatlist:roomLeft', { roomId });

      await decrementRoomActive(roomId);

      io.emit('rooms:updateCount', {
        roomId,
        userCount,
        maxUsers: room?.max_users || 25
      });

    } catch (error) {
      console.error('Error leaving room:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  };

  const getRoomUsers = async (data) => {
    try {
      const { roomId } = data;
      const users = await roomService.getRoomUsers(roomId);
      socket.emit('room:users', {
        roomId,
        users,
        count: users.length
      });
    } catch (error) {
      console.error('Error getting room users:', error);
      socket.emit('error', { message: 'Failed to get room users' });
    }
  };

  const adminKick = async (data) => {
    try {
      const { roomId, targetUserId, targetUsername, adminId } = data;

      const isAdmin = await roomService.isRoomAdmin(roomId, adminId);
      if (!isAdmin) {
        socket.emit('error', { message: 'You are not an admin' });
        return;
      }

      await roomService.kickUser(roomId, targetUserId, targetUsername);

      io.to(`room:${roomId}`).emit('system:message', {
        roomId,
        message: `${targetUsername} has been kicked from the room`,
        timestamp: new Date().toISOString(),
        type: 'error'
      });

      io.to(`room:${roomId}`).emit('room:user:kicked', {
        roomId,
        userId: targetUserId,
        username: targetUsername
      });

      const users = await roomService.getRoomUsers(roomId);
      io.to(`room:${roomId}`).emit('room:users', {
        roomId,
        users,
        count: users.length
      });

    } catch (error) {
      console.error('Error kicking user:', error);
      socket.emit('error', { message: 'Failed to kick user' });
    }
  };

  const adminBan = async (data) => {
    try {
      const { roomId, targetUserId, targetUsername, adminId, reason, duration } = data;

      const isAdmin = await roomService.isRoomAdmin(roomId, adminId);
      if (!isAdmin) {
        socket.emit('error', { message: 'You are not an admin' });
        return;
      }

      await roomService.banUser(roomId, targetUserId, targetUsername, adminId, reason);

      io.to(`room:${roomId}`).emit('system:message', {
        roomId,
        message: `${targetUsername} has been banned from the room${reason ? `: ${reason}` : ''}`,
        timestamp: new Date().toISOString(),
        type: 'error'
      });

      io.to(`room:${roomId}`).emit('room:user:banned', {
        roomId,
        userId: targetUserId,
        username: targetUsername,
        reason
      });

      const users = await roomService.getRoomUsers(roomId);
      io.to(`room:${roomId}`).emit('room:users', {
        roomId,
        users,
        count: users.length
      });

    } catch (error) {
      console.error('Error banning user:', error);
      socket.emit('error', { message: 'Failed to ban user' });
    }
  };

  const adminUnban = async (data) => {
    try {
      const { roomId, targetUserId, targetUsername, adminId } = data;

      const isAdmin = await roomService.isRoomAdmin(roomId, adminId);
      if (!isAdmin) {
        socket.emit('error', { message: 'You are not an admin' });
        return;
      }

      await roomService.unbanUser(roomId, targetUserId, targetUsername);

      socket.emit('room:user:unbanned', {
        roomId,
        userId: targetUserId,
        username: targetUsername
      });

    } catch (error) {
      console.error('Error unbanning user:', error);
      socket.emit('error', { message: 'Failed to unban user' });
    }
  };

  const getRoomInfo = async (data) => {
    try {
      const { roomId } = data;
      const room = await roomService.getRoomById(roomId);
      const users = await roomService.getRoomUsers(roomId);
      const admins = await roomService.getRoomAdmins(roomId);

      socket.emit('room:info', {
        room,
        users,
        admins,
        userCount: users.length
      });
    } catch (error) {
      console.error('Error getting room info:', error);
      socket.emit('error', { message: 'Failed to get room info' });
    }
  };

  const createRoom = async (data) => {
    try {
      const { name, ownerId, description, maxUsers, isPrivate, password } = data;

      if (!name || !ownerId) {
        socket.emit('error', { message: 'Name and owner ID are required' });
        return;
      }

      const existingRoom = await roomService.getRoomByName(name);
      if (existingRoom) {
        socket.emit('room:create:error', { message: 'Room name already exists' });
        return;
      }

      const room = await roomService.createRoom(name, ownerId, description, maxUsers, isPrivate, password);

      if (!room) {
        socket.emit('room:create:error', { message: 'Failed to create room' });
        return;
      }

      socket.emit('room:created', { room });
      io.emit('rooms:update', { room, action: 'created' });

    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  };

  socket.on('join_room', joinRoom);
  socket.on('leave_room', leaveRoom);
  socket.on('room:users:get', getRoomUsers);
  socket.on('room:admin:kick', adminKick);
  socket.on('room:admin:ban', adminBan);
  socket.on('room:admin:unban', adminUnban);
  socket.on('room:info:get', getRoomInfo);
  socket.on('room:create', createRoom);

  socket.on('disconnect', async () => {
    try {
      console.log(`⚠️ Socket disconnected: ${socket.id}`);

      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

      for (const roomId of rooms) {
        const roomUsers = await getRoomPresenceUsers(roomId); // Assuming getRoomPresenceUsers is available
        const user = roomUsers.find(u => u.socketId === socket.id);

        if (user) {
          const timerKey = `${user.id}-${roomId}`;

          // Set a 15-second delay before actually removing user
          const timer = setTimeout(async () => {
            console.log(`⏰ 15s timeout - removing user from room: ${user.username}`);

            await removeUserFromRoom(roomId, user.id, user.username);
            await getPresence(user.username); // Assuming this also removes presence if needed
            await removeUserRoom(user.username, roomId); // Remove from redisUtils as well

            const updatedUsers = await getRoomPresenceUsers(roomId); // Assuming getRoomPresenceUsers is available

            io.to(`room:${roomId}`).emit('room:users', {
              roomId,
              users: updatedUsers
            });

            io.to(`room:${roomId}`).emit('system:message', {
              roomId,
              message: `${user.username} has left`,
              timestamp: new Date().toISOString(),
              type: 'system'
            });

            disconnectTimers.delete(timerKey);
          }, 15000);

          disconnectTimers.set(timerKey, timer);
          console.log(`⏳ Started 15s disconnect timer for: ${user.username}`);
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
};