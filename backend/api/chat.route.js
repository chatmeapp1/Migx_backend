
const express = require('express');
const router = express.Router();
const { getRedisClient } = require('../redis');
const roomService = require('../services/roomService');

router.get('/list/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username required' 
      });
    }

    const redis = getRedisClient();
    const roomIds = await redis.sMembers(`user:rooms:${username}`);
    
    const rooms = await Promise.all(
      roomIds.map(async (roomId) => {
        const lastMsg = await redis.hGetAll(`room:lastmsg:${roomId}`);
        const roomInfo = await roomService.getRoomById(roomId);
        
        if (!roomInfo) {
          // Remove invalid room from user's list
          await redis.sRem(`user:rooms:${username}`, roomId);
          return null;
        }
        
        const users = await roomService.getRoomUsers(roomId);
        
        return {
          type: 'room',
          id: roomId,
          roomId: roomId,
          name: roomInfo.name,
          roomName: roomInfo.name,
          lastMessage: lastMsg.message || '',
          lastUsername: lastMsg.username || '',
          timestamp: lastMsg.timestamp || Date.now().toString(),
          userCount: users.length,
          isPrivate: roomInfo.is_private || false
        };
      })
    );
    
    const validRooms = rooms.filter(r => r !== null);

    res.json({
      success: true,
      rooms: validRooms,
      dms: [] // DMs will be implemented later
    });
    
  } catch (error) {
    console.error('Get chat list error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get chat list' 
    });
  }
});

router.get('/joined/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username required' 
      });
    }

    const redis = getRedisClient();
    const roomIds = await redis.sMembers(`user:rooms:${username}`);
    
    const roomsWithInfo = await Promise.all(
      roomIds.map(async (roomId) => {
        const roomInfo = await roomService.getRoomById(roomId);
        if (!roomInfo) return null;
        
        return {
          id: roomId,
          name: roomInfo.name,
          type: 'room'
        };
      })
    );

    const validRooms = roomsWithInfo.filter(r => r !== null);

    res.json({
      success: true,
      rooms: validRooms
    });
    
  } catch (error) {
    console.error('Get joined rooms error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get joined rooms' 
    });
  }
});

module.exports = router;
