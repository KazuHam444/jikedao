const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');

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

    // 构建AI提示词
    let prompt = letter.prompt_template || `你是一位来自${letter.era}的历史人物${letter.figure_name}。`;
    if (letter.biography) {
      prompt += `你的生平简介：${letter.biography}。`;
    }
    prompt += `\n\n你收到了一封来自现代的信件：\n标题：${letter.title}\n内容：${letter.content}\n\n请以${letter.figure_name}的身份和语气，用符合${letter.era}时代背景的语言风格，给这封信写一封回信。回信应该真诚、有深度，体现历史人物的性格特点。`;

    // 调用AI API生成回信
    let replyContent = '';
    try {
      // 这里使用OpenAI API作为示例，你可以替换为其他AI服务
      if (process.env.AI_API_KEY && process.env.AI_API_URL) {
        const response = await axios.post(
          process.env.AI_API_URL,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: '你是一位历史人物，需要以该历史人物的身份和语气回信。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.AI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        replyContent = response.data.choices[0].message.content;
      } else {
        // 如果没有配置AI API，使用模拟回信
        replyContent = `亲爱的朋友，\n\n感谢你的来信。作为${letter.figure_name}，我很高兴能收到你的问候。\n\n${letter.content}\n\n你的来信让我深感欣慰。希望你能继续传承我们的精神，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n${letter.figure_name}\n${new Date().toLocaleDateString('zh-CN')}`;
      }
    } catch (aiError) {
      console.error('AI生成回信错误:', aiError);
      // 如果AI调用失败，使用默认回信
      replyContent = `亲爱的朋友，\n\n感谢你的来信。作为${letter.figure_name}，我很高兴能收到你的问候。\n\n你的来信让我深感欣慰。希望你能继续传承我们的精神，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n${letter.figure_name}\n${new Date().toLocaleDateString('zh-CN')}`;
    }

    // 保存回信到数据库
    const [result] = await query(`
      INSERT INTO replies (letter_id, content, ai_model, sentiment_analysis)
      VALUES (?, ?, ?, ?)
    `, [letterId, replyContent, 'gpt-3.5-turbo', 'positive']);

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

