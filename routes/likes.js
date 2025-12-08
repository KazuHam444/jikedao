const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// 切换点赞：如果已点则取消，否则新增
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { letter_id } = req.body;
    if (!letter_id) {
      return res.status(400).json({ success: false, message: '缺少 letter_id' });
    }

    // 检查是否已点赞
    const [existing] = await query('SELECT like_id FROM likes WHERE user_id = ? AND letter_id = ?', [userId, letter_id]);
    if (existing && existing.length > 0) {
      // 已有，删除
      await query('DELETE FROM likes WHERE user_id = ? AND letter_id = ?', [userId, letter_id]);
      return res.json({ success: true, data: { liked: false } });
    }

    // 新增点赞
    await query('INSERT INTO likes (user_id, letter_id) VALUES (?, ?)', [userId, letter_id]);

    // 获取信件作者，写入通知（如果作者不是自己）
    const [letters] = await query('SELECT user_id, title FROM letters WHERE letter_id = ?', [letter_id]);
    if (letters && letters.length > 0) {
      const owner = letters[0];
      if (owner.user_id !== userId) {
        await query(
          'INSERT INTO notifications (user_id, actor_user_id, type, data) VALUES (?, ?, ?, ?)',
          [owner.user_id, userId, 'like', JSON.stringify({ letter_id, title: owner.title })]
        );
      }
    }

    res.json({ success: true, data: { liked: true } });
  } catch (error) {
    console.error('点赞切换错误:', error);
    res.status(500).json({ success: false, message: '点赞失败' });
  }
});

// 获取某信件的点赞数
router.get('/count/:letterId', async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const [rows] = await query('SELECT COUNT(*) as cnt FROM likes WHERE letter_id = ?', [letterId]);
    res.json({ success: true, data: { count: rows[0].cnt } });
  } catch (err) {
    console.error('获取点赞数失败:', err);
    res.status(500).json({ success: false, message: '获取点赞数失败' });
  }
});

module.exports = router;
