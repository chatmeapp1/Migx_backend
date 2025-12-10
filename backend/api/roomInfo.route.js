
const express = require('express');
const router = express.Router();
const { query } = require('../db/db');
const { getRoomParticipants } = require('../utils/redisUtils');

router.get('/:roomId/info', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Room ID is required' 
      });
    }
    
    // Ambil data static dari PostgreSQL
    const roomResult = await query(
      `SELECT 
        id,
        name,
        description,
        creator_name as "ownerName",
        created_at as "createdAt",
        updated_at as "updatedAt",
        room_code as "roomCode",
        max_users as "maxUsers",
        is_private as "isPrivate"
       FROM rooms
       WHERE id = $1`,
      [roomId]
    );
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Room not found' 
      });
    }
    
    const room = roomResult.rows[0];
    
    // Ambil data real-time dari Redis
    const participants = await getRoomParticipants(roomId);
    const currentUsers = participants.length;
    
    // Format response
    const roomInfo = {
      id: room.id,
      name: room.name,
      description: room.description || 'No description',
      ownerName: room.ownerName || 'Unknown',
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      roomCode: room.roomCode,
      maxUsers: room.maxUsers || 25,
      isPrivate: room.isPrivate || false,
      currentUsers,
      participants
    };
    
    res.json({
      success: true,
      roomInfo
    });
    
  } catch (error) {
    console.error('Get room info error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get room info' 
    });
  }
});

module.exports = router;
