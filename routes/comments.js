const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// 添加评论
router.post('/', authenticate, [body('letter_id').isInt(), body('content').trim().isLength({ min: 1 })], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: '验证失败', errors: errors.array() });

    const userId = req.user.user_id;
    const { letter_id, content } = req.body;

    // 插入评论
    const [result] = await query('INSERT INTO comments (user_id, letter_id, content) VALUES (?, ?, ?)', [userId, letter_id, content]);

    // 获取信件作者并创建通知
    const [letters] = await query('SELECT user_id, title FROM letters WHERE letter_id = ?', [letter_id]);
    if (letters && letters.length > 0) {
      const owner = letters[0];
      if (owner.user_id !== userId) {
        await query('INSERT INTO notifications (user_id, actor_user_id, type, data) VALUES (?, ?, ?, ?)', [owner.user_id, userId, 'comment', JSON.stringify({ letter_id, title: owner.title, comment_id: result.insertId })]);

        // 也插入站内信到 messages 表，方便用户在站内查看（非必须）
        try {
          await query('INSERT INTO messages (to_user_id, from_user_id, subject, body) VALUES (?, ?, ?, ?)', [owner.user_id, userId, `你的信《${owner.title}》收到一条新评论`, content]);
        } catch (err) {
          console.warn('写入站内信失败：', err);
        }
      }
    }

    res.status(201).json({ success: true, data: { comment_id: result.insertId } });
  } catch (err) {
    console.error('添加评论失败:', err);
    res.status(500).json({ success: false, message: '添加评论失败' });
  }
});

// 获取信件的评论列表
router.get('/letter/:letterId', async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const [rows] = await query(`SELECT c.comment_id, c.content, c.created_at, c.user_id, u.username FROM comments c INNER JOIN users u ON c.user_id = u.user_id WHERE c.letter_id = ? ORDER BY c.created_at ASC`, [letterId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ success: false, message: '获取评论失败' });
  }
});

module.exports = router;
