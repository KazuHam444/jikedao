const express = require('express');
const router = express.Router();
const { body, validationResult, query: queryValidator } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// 获取公开信件列表（首页展示）
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 获取被精选的公开信件
    const [letters] = await query(`
      SELECT 
        l.letter_id,
        l.title,
        l.content,
        l.paper_style,
        l.font_style,
        l.border_style,
        l.writing_date,
          (SELECT COUNT(*) FROM likes WHERE letter_id = l.letter_id) as like_count,
        u.username,
        hf.name as figure_name,
        hf.era,
        hf.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE letter_id = l.letter_id) as like_count
      FROM letters l
      INNER JOIN users u ON l.user_id = u.user_id
      INNER JOIN historical_figures hf ON l.figure_id = hf.figure_id
      WHERE l.is_public = TRUE AND l.is_featured = TRUE
      ORDER BY l.writing_date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // 获取总数
    const [countResult] = await query(`
      SELECT COUNT(*) as total
      FROM letters
      WHERE is_public = TRUE AND is_featured = TRUE
    `);

    res.json({
      success: true,
      data: {
        letters,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取公开信件错误:', error);
    res.status(500).json({
      success: false,
      message: '获取信件列表失败'
    });
  }
});

// 获取用户自己的信件列表
router.get('/my-letters', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [letters] = await query(`
      SELECT 
        l.letter_id,
        l.title,
        l.content,
        l.paper_style,
        l.font_style,
        l.border_style,
        l.is_public,
        l.is_featured,
        l.writing_date,
          (SELECT COUNT(*) FROM likes WHERE letter_id = l.letter_id) as like_count,
          (SELECT COUNT(*) FROM likes WHERE letter_id = l.letter_id) as like_count,
        l.status,
        hf.name as figure_name,
        hf.era,
        hf.avatar_url,
        CASE WHEN r.reply_id IS NOT NULL THEN TRUE ELSE FALSE END as has_reply
        , (SELECT COUNT(*) FROM likes WHERE letter_id = l.letter_id) as like_count
      FROM letters l
      INNER JOIN historical_figures hf ON l.figure_id = hf.figure_id
      LEFT JOIN replies r ON l.letter_id = r.letter_id
      WHERE l.user_id = ?
      ORDER BY l.writing_date DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    const [countResult] = await query(`
      SELECT COUNT(*) as total
      FROM letters
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        letters,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户信件错误:', error);
    res.status(500).json({
      success: false,
      message: '获取信件列表失败'
    });
  }
});

// 获取信件详情
router.get('/:letterId', async (req, res) => {
  try {
    const letterId = req.params.letterId;

    const [letters] = await query(`
      SELECT 
        l.*,
        u.username,
        hf.name as figure_name,
        hf.era,
        hf.biography,
        hf.avatar_url
      FROM letters l
      INNER JOIN users u ON l.user_id = u.user_id
      INNER JOIN historical_figures hf ON l.figure_id = hf.figure_id
      WHERE l.letter_id = ?
    `, [letterId]);

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: '信件不存在'
      });
    }

    const letter = letters[0];

    // 检查权限：如果不是公开信件，只有作者可以查看
    if (!letter.is_public) {
      let userId = null;
      const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];
      
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          userId = decoded.userId;
        } catch (error) {
          // Token无效，继续检查
        }
      }

      if (!userId || userId !== letter.user_id) {
        return res.status(403).json({
          success: false,
          message: '无权访问此信件'
        });
      }
    }

    // 获取回信（如果存在）
    const [replies] = await query(`
      SELECT * FROM replies WHERE letter_id = ?
    `, [letterId]);

    res.json({
      success: true,
      data: {
        letter,
        reply: replies && replies.length > 0 ? replies[0] : null
      }
    });
  } catch (error) {
    console.error('获取信件详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取信件详情失败'
    });
  }
});

// 创建信件
router.post('/', authenticate, [
  body('figure_id').isInt().withMessage('请选择历史人物'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('标题长度必须在1-200个字符之间'),
  body('content').trim().isLength({ min: 1 }).withMessage('信件内容不能为空'),
  body('paper_style').optional().isString(),
  body('font_style').optional().isString(),
  body('border_style').optional().isString(),
  body('is_public').optional().isBoolean()
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

    const userId = req.user.user_id;
    const {
      figure_id,
      title,
      content,
      paper_style = 'default',
      font_style = 'default',
      border_style = 'default',
      is_public = false
    } = req.body;

    // 验证历史人物是否存在
    const [figures] = await query(
      'SELECT figure_id FROM historical_figures WHERE figure_id = ? AND is_active = TRUE',
      [figure_id]
    );

    if (!figures || figures.length === 0) {
      return res.status(404).json({
        success: false,
        message: '历史人物不存在'
      });
    }

    // 插入信件
    const [result] = await query(`
      INSERT INTO letters 
      (user_id, figure_id, title, content, paper_style, font_style, border_style, is_public, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent')
    `, [userId, figure_id, title, content, paper_style, font_style, border_style, is_public]);

    res.status(201).json({
      success: true,
      message: '信件创建成功',
      data: {
        letter_id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建信件错误:', error);
    res.status(500).json({
      success: false,
      message: '创建信件失败'
    });
  }
});

// 更新信件
router.put('/:letterId', authenticate, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('paper_style').optional().isString(),
  body('font_style').optional().isString(),
  body('border_style').optional().isString(),
  body('is_public').optional().isBoolean()
], async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const userId = req.user.user_id;

    // 检查信件是否存在且属于当前用户
    const [letters] = await query(
      'SELECT letter_id FROM letters WHERE letter_id = ? AND user_id = ?',
      [letterId, userId]
    );

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: '信件不存在或无权限修改'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (req.body.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(req.body.title);
    }
    if (req.body.content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(req.body.content);
    }
    if (req.body.paper_style !== undefined) {
      updateFields.push('paper_style = ?');
      updateValues.push(req.body.paper_style);
    }
    if (req.body.font_style !== undefined) {
      updateFields.push('font_style = ?');
      updateValues.push(req.body.font_style);
    }
    if (req.body.border_style !== undefined) {
      updateFields.push('border_style = ?');
      updateValues.push(req.body.border_style);
    }
    if (req.body.is_public !== undefined) {
      updateFields.push('is_public = ?');
      updateValues.push(req.body.is_public);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      });
    }

    updateValues.push(letterId);

    await query(
      `UPDATE letters SET ${updateFields.join(', ')} WHERE letter_id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: '信件更新成功'
    });
  } catch (error) {
    console.error('更新信件错误:', error);
    res.status(500).json({
      success: false,
      message: '更新信件失败'
    });
  }
});

// 删除信件
router.delete('/:letterId', authenticate, async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const userId = req.user.user_id;

    // 检查信件是否存在且属于当前用户
    const [letters] = await query(
      'SELECT letter_id FROM letters WHERE letter_id = ? AND user_id = ?',
      [letterId, userId]
    );

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: '信件不存在或无权限删除'
      });
    }

    await query('DELETE FROM letters WHERE letter_id = ?', [letterId]);

    res.json({
      success: true,
      message: '信件删除成功'
    });
  } catch (error) {
    console.error('删除信件错误:', error);
    res.status(500).json({
      success: false,
      message: '删除信件失败'
    });
  }
});

module.exports = router;

