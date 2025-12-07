
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const userService = require('../services/userService');

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await userService.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notifications = await notificationService.getNotifications(username);
    const unreadCount = await notificationService.getUnreadCount(username);
    
    res.json({
      notifications,
      unreadCount
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await userService.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await notificationService.clearNotifications(username);
    
    res.json({
      success: true,
      message: 'Notifications cleared'
    });
    
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

router.get('/:username/count', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await userService.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const count = await notificationService.getUnreadCount(username);
    
    res.json({
      count
    });
    
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Failed to get notification count' });
  }
});

module.exports = router;
