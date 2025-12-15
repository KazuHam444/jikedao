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

    // 插入新用户（对邮箱进行加密以保护静态存储）
    const { encrypt } = require('../utils/encryption');
    const encryptedEmail = encrypt(email);

    const [result] = await query(
      'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
      [username, passwordHash, encryptedEmail]
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

    // 返回前解密邮箱（如果已加密）
    const { decrypt } = require('../utils/encryption');
    let userEmail = user.email;
    try {
      userEmail = decrypt(user.email);
    } catch (e) {
      // 解密失败则保留原始值
      console.warn('解密邮箱失败:', e.message);
    }

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: userEmail
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

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
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

