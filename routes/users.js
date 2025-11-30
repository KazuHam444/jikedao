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

    res.json({
      success: true,
      data: users[0]
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

