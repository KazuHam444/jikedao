const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 获取所有样式配置
router.get('/', async (req, res) => {
  try {
    const styleType = req.query.type; // paper, font, border

    let sql = `
      SELECT 
        style_id,
        style_type,
        style_name,
        style_value,
        preview_url
      FROM style_configs
      WHERE is_active = TRUE
    `;
    const params = [];

    if (styleType) {
      sql += ' AND style_type = ?';
      params.push(styleType);
    }

    sql += ' ORDER BY style_type, style_id';

    const [styles] = await query(sql, params);

    // 按类型分组
    const groupedStyles = {
      paper: [],
      font: [],
      border: []
    };

    styles.forEach(style => {
      if (groupedStyles[style.style_type]) {
        groupedStyles[style.style_type].push(style);
      }
    });

    res.json({
      success: true,
      data: styleType ? groupedStyles[styleType] : groupedStyles
    });
  } catch (error) {
    console.error('获取样式配置错误:', error);
    res.status(500).json({
      success: false,
      message: '获取样式配置失败'
    });
  }
});

module.exports = router;

