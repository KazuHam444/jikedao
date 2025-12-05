const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const aiService = require('../utils/aiService');

// 生成AI回信
router.post('/generate/:letterId', authenticate, async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const userId = req.user.user_id;

    // 检查信件是否存在且属于当前用户
    const [letters] = await query(`
      SELECT 
        l.*,
        hf.name as figure_name,
        hf.era,
        hf.biography,
        hf.prompt_template
      FROM letters l
      INNER JOIN historical_figures hf ON l.figure_id = hf.figure_id
      WHERE l.letter_id = ? AND l.user_id = ?
    `, [letterId, userId]);

    if (!letters || letters.length === 0) {
      return res.status(404).json({
        success: false,
        message: '信件不存在或无权限'
      });
    }

    const letter = letters[0];

    // 检查是否已有回信
    const [existingReplies] = await query(
      'SELECT reply_id FROM replies WHERE letter_id = ?',
      [letterId]
    );

    if (existingReplies && existingReplies.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该信件已有回信'
      });
    }

    // 调用AI服务生成回信
    let replyContent = '';
    let aiModel = 'fallback';
    let useAI = false;

    try {
      // 尝试使用AI服务生成回信
      replyContent = await aiService.generateReply(
        {
          title: letter.title,
          content: letter.content
        },
        {
          name: letter.figure_name,
          era: letter.era,
          biography: letter.biography,
          prompt_template: letter.prompt_template
        }
      );
      aiModel = process.env.AI_MODEL || 'gpt-3.5-turbo';
      useAI = true;
    } catch (aiError) {
      console.error('AI生成回信错误:', aiError);
      
      // 如果AI服务不可用，使用模拟回信
      replyContent = aiService.generateFallbackReply(
        {
          title: letter.title,
          content: letter.content
        },
        {
          name: letter.figure_name,
          era: letter.era
        }
      );
      
      // 记录错误信息（但不返回给用户，避免暴露配置信息）
      console.warn('使用模拟回信，原因:', aiError.message);
    }

    // 保存回信到数据库
    const [result] = await query(`
      INSERT INTO replies (letter_id, content, ai_model, sentiment_analysis)
      VALUES (?, ?, ?, ?)
    `, [letterId, replyContent, aiModel, 'positive']);
    
    // 如果使用了AI，在响应中提示
    if (useAI) {
      console.log(`✅ 成功使用AI生成回信，模型: ${aiModel}`);
    } else {
      console.warn('⚠️ 使用模拟回信，请配置AI API以使用真实AI生成');
    }

    // 更新信件状态
    await query(
      'UPDATE letters SET status = ? WHERE letter_id = ?',
      ['replied', letterId]
    );

    res.status(201).json({
      success: true,
      message: '回信生成成功',
      data: {
        reply_id: result.insertId,
        content: replyContent
      }
    });
  } catch (error) {
    console.error('生成回信错误:', error);
    res.status(500).json({
      success: false,
      message: '生成回信失败'
    });
  }
});

// 获取回信
router.get('/:letterId', async (req, res) => {
  try {
    const letterId = req.params.letterId;

    const [replies] = await query(`
      SELECT r.*, l.user_id, l.is_public
      FROM replies r
      INNER JOIN letters l ON r.letter_id = l.letter_id
      WHERE r.letter_id = ?
    `, [letterId]);

    if (!replies || replies.length === 0) {
      return res.status(404).json({
        success: false,
        message: '回信不存在'
      });
    }

    const reply = replies[0];

    // 检查权限：如果不是公开信件，只有作者可以查看
    if (!reply.is_public) {
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

      if (!userId || userId !== reply.user_id) {
        return res.status(403).json({
          success: false,
          message: '无权访问此回信'
        });
      }
    }

    res.json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('获取回信错误:', error);
    res.status(500).json({
      success: false,
      message: '获取回信失败'
    });
  }
});

module.exports = router;

