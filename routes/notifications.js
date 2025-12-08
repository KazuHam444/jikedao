const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// 获取用户通知列表
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await query(
      `SELECT notification_id, actor_user_id, type, data, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('获取通知失败:', err);
    res.status(500).json({ success: false, message: '获取通知失败' });
  }
});

// 标记通知为已读
router.post('/mark-read', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { ids } = req.body; // ids: [1,2,3]
    if (!Array.isArray(ids)) return res.status(400).json({ success: false, message: 'ids 必须为数组' });
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND notification_id IN (?)', [userId, ids]);
    res.json({ success: true });
  } catch (err) {
    console.error('标记通知已读失败:', err);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

// 获取未读计数
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await query('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0', [userId]);
    res.json({ success: true, data: { count: rows[0].cnt } });
  } catch (err) {
    console.error('获取未读通知数失败:', err);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

module.exports = router;
