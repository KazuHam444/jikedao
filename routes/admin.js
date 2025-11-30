const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateAdmin, authenticateSuperAdmin } = require('../middleware/auth');

// 获取所有用户列表（管理员）
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let sql = `
      SELECT 
        user_id,
        username,
        email,
        created_at,
        last_login,
        is_active,
        (SELECT COUNT(*) FROM letters WHERE user_id = users.user_id) as letter_count
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (username LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [users] = await query(sql, params);

    const [countResult] = await query(`
      SELECT COUNT(*) as total FROM users
      ${search ? 'WHERE username LIKE ? OR email LIKE ?' : ''}
    `, search ? [`%${search}%`, `%${search}%`] : []);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 获取所有信件列表（管理员）
router.get('/letters', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // draft, sent, replied
    const isPublic = req.query.is_public;
    const isFeatured = req.query.is_featured;

    let sql = `
      SELECT 
        l.letter_id,
        l.title,
        l.content,
        l.is_public,
        l.is_featured,
        l.writing_date,
        l.status,
        u.username,
        u.email,
        hf.name as figure_name,
        hf.era,
        CASE WHEN r.reply_id IS NOT NULL THEN TRUE ELSE FALSE END as has_reply
      FROM letters l
      INNER JOIN users u ON l.user_id = u.user_id
      INNER JOIN historical_figures hf ON l.figure_id = hf.figure_id
      LEFT JOIN replies r ON l.letter_id = r.letter_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }
    if (isPublic !== undefined) {
      sql += ' AND l.is_public = ?';
      params.push(isPublic === 'true');
    }
    if (isFeatured !== undefined) {
      sql += ' AND l.is_featured = ?';
      params.push(isFeatured === 'true');
    }

    sql += ' ORDER BY l.writing_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [letters] = await query(sql, params);

    const [countResult] = await query(`
      SELECT COUNT(*) as total FROM letters WHERE 1=1
      ${status ? 'AND status = ?' : ''}
      ${isPublic !== undefined ? 'AND is_public = ?' : ''}
      ${isFeatured !== undefined ? 'AND is_featured = ?' : ''}
    `, [status, isPublic !== undefined ? isPublic === 'true' : null, isFeatured !== undefined ? isFeatured === 'true' : null].filter(v => v !== null));

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
    console.error('获取信件列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取信件列表失败'
    });
  }
});

// 设置信件为精选（在首页展示）
router.put('/letters/:letterId/feature', authenticateAdmin, async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const { is_featured } = req.body;

    // 检查信件是否存在
    const [letters] = await query(
      'SELECT letter_id, is_public FROM letters WHERE letter_id = ?',
      [letterId]
    );

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: '信件不存在'
      });
    }

    // 只有公开信件才能被精选
    if (is_featured && !letters[0].is_public) {
      return res.status(400).json({
        success: false,
        message: '只有公开信件才能被设置为精选'
      });
    }

    await query(
      'UPDATE letters SET is_featured = ? WHERE letter_id = ?',
      [is_featured, letterId]
    );

    res.json({
      success: true,
      message: is_featured ? '已设置为精选' : '已取消精选'
    });
  } catch (error) {
    console.error('设置精选错误:', error);
    res.status(500).json({
      success: false,
      message: '设置精选失败'
    });
  }
});

// 设置用户状态（启用/禁用）
router.put('/users/:userId/status', authenticateSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { is_active } = req.body;

    await query(
      'UPDATE users SET is_active = ? WHERE user_id = ?',
      [is_active, userId]
    );

    res.json({
      success: true,
      message: is_active ? '用户已启用' : '用户已禁用'
    });
  } catch (error) {
    console.error('设置用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '设置用户状态失败'
    });
  }
});

// 获取统计数据
router.get('/statistics', authenticateAdmin, async (req, res) => {
  try {
    const [userCount] = await query('SELECT COUNT(*) as total FROM users');
    const [letterCount] = await query('SELECT COUNT(*) as total FROM letters');
    const [replyCount] = await query('SELECT COUNT(*) as total FROM replies');
    const [featuredCount] = await query('SELECT COUNT(*) as total FROM letters WHERE is_featured = TRUE');
    const [publicCount] = await query('SELECT COUNT(*) as total FROM letters WHERE is_public = TRUE');
    const [figureCount] = await query('SELECT COUNT(*) as total FROM historical_figures WHERE is_active = TRUE');

    res.json({
      success: true,
      data: {
        users: userCount[0].total,
        letters: letterCount[0].total,
        replies: replyCount[0].total,
        featured_letters: featuredCount[0].total,
        public_letters: publicCount[0].total,
        historical_figures: figureCount[0].total
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

// 创建历史人物（管理员）
router.post('/figures', authenticateAdmin, [
  body('name').trim().notEmpty().withMessage('姓名不能为空'),
  body('era').trim().notEmpty().withMessage('时代不能为空'),
  body('biography').optional().isString(),
  body('avatar_url').optional().isURL().withMessage('头像URL格式不正确'),
  body('prompt_template').optional().isString()
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

    const { name, era, biography, avatar_url, prompt_template } = req.body;

    const [result] = await query(`
      INSERT INTO historical_figures (name, era, biography, avatar_url, prompt_template)
      VALUES (?, ?, ?, ?, ?)
    `, [name, era, biography || null, avatar_url || null, prompt_template || null]);

    res.status(201).json({
      success: true,
      message: '历史人物创建成功',
      data: {
        figure_id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建历史人物错误:', error);
    res.status(500).json({
      success: false,
      message: '创建历史人物失败'
    });
  }
});

// 更新历史人物（管理员）
router.put('/figures/:figureId', authenticateAdmin, [
  body('name').optional().trim().notEmpty(),
  body('era').optional().trim().notEmpty(),
  body('biography').optional().isString(),
  body('avatar_url').optional().isURL(),
  body('prompt_template').optional().isString(),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const figureId = req.params.figureId;
    const updateFields = [];
    const updateValues = [];

    if (req.body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(req.body.name);
    }
    if (req.body.era !== undefined) {
      updateFields.push('era = ?');
      updateValues.push(req.body.era);
    }
    if (req.body.biography !== undefined) {
      updateFields.push('biography = ?');
      updateValues.push(req.body.biography);
    }
    if (req.body.avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      updateValues.push(req.body.avatar_url);
    }
    if (req.body.prompt_template !== undefined) {
      updateFields.push('prompt_template = ?');
      updateValues.push(req.body.prompt_template);
    }
    if (req.body.is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(req.body.is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      });
    }

    updateValues.push(figureId);

    await query(
      `UPDATE historical_figures SET ${updateFields.join(', ')} WHERE figure_id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: '历史人物更新成功'
    });
  } catch (error) {
    console.error('更新历史人物错误:', error);
    res.status(500).json({
      success: false,
      message: '更新历史人物失败'
    });
  }
});

// 创建样式配置（管理员）
router.post('/styles', authenticateAdmin, [
  body('style_type').isIn(['paper', 'font', 'border']).withMessage('样式类型必须是paper、font或border'),
  body('style_name').trim().notEmpty().withMessage('样式名称不能为空'),
  body('style_value').trim().notEmpty().withMessage('样式值不能为空'),
  body('preview_url').optional().isURL()
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

    const { style_type, style_name, style_value, preview_url } = req.body;

    const [result] = await query(`
      INSERT INTO style_configs (style_type, style_name, style_value, preview_url)
      VALUES (?, ?, ?, ?)
    `, [style_type, style_name, style_value, preview_url || null]);

    res.status(201).json({
      success: true,
      message: '样式配置创建成功',
      data: {
        style_id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建样式配置错误:', error);
    res.status(500).json({
      success: false,
      message: '创建样式配置失败'
    });
  }
});

module.exports = router;

