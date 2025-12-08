#!/usr/bin/env node
/**
 * 测试 DeepSeek / AI 服务调用的脚本
 * 使用方式：在项目根目录创建 `.env` 并设置 AI_API_KEY、AI_PROVIDER=deepseek 等，
 * 或在 PowerShell 中临时设置环境变量后运行此脚本。
 *
 * 注意：不要在公共仓库提交真实密钥。
 */

require('dotenv').config();

const aiService = require('../utils/aiService');

(async () => {
  try {
    // 如果没有设置 PROVIDER，默认使用 deepseek 以便于测试
    process.env.AI_PROVIDER = process.env.AI_PROVIDER || 'deepseek';

    const letterData = {
      title: '测试：来自时空旅行者的问候',
      content: '你好，我想请教你关于历史和人生的见解。'
    };

    const figureData = {
      name: '测试人物',
      era: '测试时代',
      biography: '这是用于测试的虚拟历史人物简介。'
    };

    // 输出诊断信息（不直接打印密钥）
    const rawKey = process.env.AI_API_KEY;
    function keyInfo(k) {
      if (!k) return '未设置';
      return `长度=${k.length}, 包含CR=${/\r/.test(k)}, 包含LF=${/\n/.test(k)}, 首尾引号=${/^['\"]/.test(k)} / ${/['\"]$/.test(k)}`;
    }

    console.log('AI API Key 状态：', keyInfo(rawKey));
    console.log('正在调用 AI 服务，请确保已正确设置 AI_API_KEY 和 AI_API_URL（或在 .env 中）...');

    const reply = await aiService.generateReply(letterData, figureData);

    console.log('\n=== AI 返回的回信内容 ===\n');
    console.log(reply);
    console.log('\n=== 完成 ===');
  } catch (err) {
    console.error('测试调用失败：', err.response?.data || err.message || err);
    process.exit(1);
  }
})();
