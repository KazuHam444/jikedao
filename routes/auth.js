const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

// 用户注册
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50个字符之间'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }

    const { username, password, email } = req.body;

    // 检查用户名是否已存在
    const [existingUsers] = await query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 插入新用户
    const [result] = await query(
      'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
      [username, passwordHash, email]
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user_id: result.insertId,
        username
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('请输入用户名'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // 查找用户
    const [users] = await query(
      'SELECT user_id, username, password_hash, email, is_active FROM users WHERE username = ?',
      [username]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE users SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );

    // 生成JWT token
      const token = jwt.sign(
        { userId: user.user_id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const refreshToken = jwt.sign(
        { userId: user.user_id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 管理员登录
router.post('/admin/login', [
  body('username').notEmpty().withMessage('请输入用户名'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // 查找管理员
    const [admins] = await query(
      'SELECT admin_id, username, password_hash, email, role FROM admins WHERE username = ?',
      [username]
    );

    if (!admins || admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const admin = admins[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE admins SET last_login = NOW() WHERE admin_id = ?',
      [admin.admin_id]
    );

    // 生成JWT token
      const token = jwt.sign(
        { adminId: admin.admin_id, username: admin.username, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const refreshToken = jwt.sign(
        { adminId: admin.admin_id, role: admin.role, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        refresh_token: refreshToken,
        admin: {
          admin_id: admin.admin_id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

module.exports = router;

// 刷新令牌，获取新的访问令牌
// 支持用户与管理员，根据刷新令牌内容自动生成对应类型的访问令牌
router.post('/refresh', [
  body('refresh_token').notEmpty().withMessage('缺少刷新令牌')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }

    const { refresh_token } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(
        refresh_token,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key'
      );
    } catch (err) {
      const isExpired = err?.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired ? '刷新令牌已过期' : '刷新令牌无效'
      });
    }

    if (decoded.type !== 'refresh') {
      return res.status(400).json({ success: false, message: '令牌类型错误' });
    }

    // 如果是用户刷新
    if (decoded.userId) {
      const [users] = await query(
        'SELECT user_id, username, email, is_active FROM users WHERE user_id = ?',
        [decoded.userId]
      );
      if (!users || users.length === 0 || !users[0].is_active) {
        return res.status(401).json({ success: false, message: '用户不存在或已被禁用' });
      }

      const accessToken = jwt.sign(
        { userId: users[0].user_id, username: users[0].username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const newRefreshToken = jwt.sign(
        { userId: users[0].user_id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      return res.json({ success: true, data: { token: accessToken, refresh_token: newRefreshToken } });
    }

    // 如果是管理员刷新
    if (decoded.adminId) {
      const [admins] = await query(
        'SELECT admin_id, username, email, role FROM admins WHERE admin_id = ?',
        [decoded.adminId]
      );
      if (!admins || admins.length === 0) {
        return res.status(401).json({ success: false, message: '管理员不存在' });
      }

      const accessToken = jwt.sign(
        { adminId: admins[0].admin_id, username: admins[0].username, role: admins[0].role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      const newRefreshToken = jwt.sign(
        { adminId: admins[0].admin_id, role: admins[0].role, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );

      return res.json({ success: true, data: { token: accessToken, refresh_token: newRefreshToken } });
    }

    return res.status(400).json({ success: false, message: '无效的刷新令牌载荷' });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({ success: false, message: '刷新令牌失败，请稍后重试' });
  }
});

