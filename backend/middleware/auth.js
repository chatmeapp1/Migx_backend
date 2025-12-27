const jwt = require('jsonwebtoken');
const db = require('../db/db');
const logger = require('../utils/logger');
const sessionService = require('../services/sessionService');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    if (req.path.includes('/feed')) {
      console.log('[AUTH] Feed request without token');
    } else {
      logger.warn('AUTH_FAILED: Missing authorization header', { endpoint: req.path });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Authentication token missing. Please login again.',
      code: 'NO_TOKEN'
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    if (req.path.includes('/feed')) {
      console.log('[AUTH] Feed request with invalid Bearer format');
    } else {
      logger.warn('AUTH_FAILED: Invalid Bearer format', { endpoint: req.path });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Invalid authorization format. Please login again.',
      code: 'INVALID_BEARER_FORMAT'
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token || token.trim() === '') {
    if (req.path.includes('/feed')) {
      console.log('[AUTH] Feed request with empty token');
    } else {
      logger.warn('AUTH_FAILED: Empty token', { endpoint: req.path });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Empty token. Please login again.',
      code: 'EMPTY_TOKEN'
    });
  }

  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    if (req.path.includes('/feed')) {
      console.log('[AUTH] Feed request with malformed token (not JWT format)');
    } else {
      logger.warn('AUTH_FAILED: Malformed token format', { endpoint: req.path });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token format. Please login again.',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'migx-secret-key-2024');
    
    // 🔐 SID-based session lookup
    if (decoded.sid) {
      const session = await sessionService.getSession(decoded.sid);
      
      if (!session) {
        if (!req.path.includes('/feed')) {
          logger.warn('AUTH_FAILED: Session not found or expired', { 
            sid: decoded.sid.substring(0, 8) + '...',
            endpoint: req.path 
          });
        }
        return res.status(401).json({ 
          success: false,
          error: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED'
        });
      }

      // Attach full user data from session to request
      req.user = {
        id: session.userId,
        userId: session.userId,
        username: session.username,
        role: session.role,
        email: session.email,
        sid: decoded.sid,
        deviceId: session.deviceId,
        ip: session.ip
      };

      if (!req.path.includes('/feed')) {
        logger.info('AUTH_SUCCESS: SID session verified', { 
          userId: session.userId,
          username: session.username,
          endpoint: req.path 
        });
      }
    } else {
      // Legacy JWT support (for backward compatibility during transition)
      req.user = decoded;
      if (!req.path.includes('/feed')) {
        logger.info('AUTH_SUCCESS: Legacy token verified', { 
          userId: decoded.id || decoded.userId,
          endpoint: req.path 
        });
      }
    }
    
    next();
  } catch (err) {
    if (req.path.includes('/feed')) {
      console.log('[AUTH] Feed token verification failed:', err.message);
    } else {
      logger.warn('AUTH_FAILED: Token verification error', { 
        error: err.message,
        endpoint: req.path 
      });
    }
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token. Please login again.',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
}

async function superAdminMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication token missing.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token format.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'migx-secret-key-2024');
    
    // 🔐 SID-based session lookup for super admin
    let userId, userRole;
    
    if (decoded.sid) {
      const session = await sessionService.getSession(decoded.sid);
      if (!session) {
        return res.status(401).json({ 
          success: false,
          error: 'Session expired. Please login again.' 
        });
      }
      userId = session.userId;
      userRole = session.role;
      req.user = {
        id: session.userId,
        userId: session.userId,
        username: session.username,
        role: session.role,
        sid: decoded.sid
      };
    } else {
      // Legacy support
      userId = decoded.id || decoded.userId;
      const user = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (user.rows.length === 0) {
        return res.status(401).json({ 
          success: false,
          error: 'User not found.' 
        });
      }
      userRole = user.rows[0].role;
      req.user = decoded;
    }

    if (userRole !== 'super_admin') {
      console.log('❌ Access denied - user is not super_admin. Role:', userRole);
      return res.status(403).json({ 
        success: false,
        error: 'Admin access denied. Super admin role required.' 
      });
    }

    console.log('✅ Super admin verified for user:', userId);
    next();
  } catch (err) {
    console.error('❌ Super admin middleware error:', err.message);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed.' 
    });
  }
}

module.exports = authMiddleware;
module.exports.superAdminMiddleware = superAdminMiddleware;
