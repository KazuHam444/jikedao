const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// 验证JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 验证用户是否存在且激活
    const [users] = await query(
      'SELECT user_id, username, email, is_active FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (!users || users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

// 验证管理员权限
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 验证管理员是否存在
    const [admins] = await query(
      'SELECT admin_id, username, email, role FROM admins WHERE admin_id = ?',
      [decoded.adminId]
    );

    if (!admins || admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: '管理员不存在'
      });
    }

    req.admin = admins[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

// 验证超级管理员权限
const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [admins] = await query(
      'SELECT admin_id, username, email, role FROM admins WHERE admin_id = ? AND role = ?',
      [decoded.adminId, 'super_admin']
    );

    if (!admins || admins.length === 0) {
      return res.status(403).json({
        success: false,
        message: '需要超级管理员权限'
      });
    }

    req.admin = admins[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

module.exports = {
  authenticate,
  authenticateAdmin,
  authenticateSuperAdmin
};

