const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 获取所有历史人物列表
router.get('/', async (req, res) => {
  try {
    const [figures] = await query(`
      SELECT 
        figure_id,
        name,
        era,
        biography,
        avatar_url,
        created_at
      FROM historical_figures
      WHERE is_active = TRUE
      ORDER BY era, name
    `);

    res.json({
      success: true,
      data: figures
    });
  } catch (error) {
    console.error('获取历史人物列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取历史人物列表失败'
    });
  }
});

// 获取历史人物详情
router.get('/:figureId', async (req, res) => {
  try {
    const figureId = req.params.figureId;

    const [figures] = await query(`
      SELECT 
        figure_id,
        name,
        era,
        biography,
        avatar_url,
        created_at
      FROM historical_figures
      WHERE figure_id = ? AND is_active = TRUE
    `, [figureId]);

    if (!figures || figures.length === 0) {
      return res.status(404).json({
        success: false,
        message: '历史人物不存在'
      });
    }

    res.json({
      success: true,
      data: figures[0]
    });
  } catch (error) {
    console.error('获取历史人物详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取历史人物详情失败'
    });
  }
});

module.exports = router;

