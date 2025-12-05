const express = require('express');
const router = express.Router();
const userService = require('../server/services/userService');
const { getUserLevel } = require('../server/utils/xpLeveling');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    let user = await userService.getUserByUsername(username);
    
    if (!user) {
      user = await userService.createUser(username, password);
      if (!user || user.error) {
        return res.status(400).json({ error: user?.error || 'Failed to create user' });
      }
    }
    
    const levelData = await getUserLevel(user.id);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        credits: user.credits,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        level: levelData.level,
        xp: levelData.xp,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const existing = await userService.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const user = await userService.createUser(username, password, email);
    
    if (!user || user.error) {
      return res.status(400).json({ error: user?.error || 'Registration failed' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        credits: user.credits,
        role: user.role,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    
    res.json({
      exists: !!user
    });
    
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});

module.exports = router;
