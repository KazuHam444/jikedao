const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [users] = await query(`
      SELECT 
        user_id,
        username,
        email,
        created_at,
        last_login
      FROM users
      WHERE user_id = ?
    `, [userId]);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 解密邮箱字段后返回
    const { decrypt } = require('../utils/encryption');
    const user = users[0];
    try {
      user.email = decrypt(user.email);
    } catch (e) {
      console.warn('解密邮箱失败:', e.message);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

module.exports = router;

