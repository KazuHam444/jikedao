const axios = require('axios');

/**
 * AI服务配置
 * 支持多种AI服务提供商
 */
class AIService {
  constructor() {
    // 读取并清洗 API Key：去除首尾空白，剥离包裹的单/双引号
    let key = process.env.AI_API_KEY;
    if (typeof key === 'string') {
      key = key.trim();
      if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1).trim();
      }
      // 如果包含换行或回车，视为非法
      if (/\r|\n/.test(key)) {
        console.warn('AI_API_KEY 包含换行或回车字符，已清洗但建议检查 .env 或环境变量的设置');
        key = key.replace(/\r|\n/g, '');
      }
    }
    this.apiKey = key;
    this.apiUrl = process.env.AI_API_URL;
    this.provider = process.env.AI_PROVIDER || 'openai'; // openai, deepseek, qwen, etc.
  }

  /**
   * 生成回信内容
   * @param {Object} letterData - 信件数据
   * @param {Object} figureData - 历史人物数据
   * @returns {Promise<string>} 回信内容
   */
  async generateReply(letterData, figureData) {
    // 检查是否配置了AI API
    if (!this.apiKey || !this.apiUrl) {
      throw new Error('AI_API_KEY 或 AI_API_URL 未配置，请查看配置说明');
    }

    // 构建提示词
    const prompt = this.buildPrompt(letterData, figureData);

    try {
      switch (this.provider.toLowerCase()) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'deepseek':
          return await this.callDeepSeek(prompt);
        case 'qwen':
          return await this.callQwen(prompt);
        default:
          return await this.callOpenAI(prompt);
      }
    } catch (error) {
      console.error('AI API调用失败:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 构建提示词
   */
  buildPrompt(letterData, figureData) {
    let prompt = figureData.prompt_template || `你是一位来自${figureData.era}的历史人物${figureData.name}。`;
    
    if (figureData.biography) {
      prompt += `\n\n你的生平简介：${figureData.biography}`;
    }
    
    prompt += `\n\n你收到了一封来自现代的信件：\n标题：${letterData.title}\n内容：${letterData.content}\n\n`;
    prompt += `请以${figureData.name}的身份和语气，用符合${figureData.era}时代背景的语言风格，给这封信写一封真诚、有深度的回信。`;
    prompt += `回信应该：\n1. 体现历史人物的性格特点和思想\n2. 回应信件中的具体内容\n3. 使用符合历史时代的语言风格\n4. 字数控制在200-500字之间\n5. 以"此致"和"敬礼"结尾，并署名`;

    return prompt;
  }

  /**
   * 调用OpenAI API
   */
  async callOpenAI(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位历史人物，需要以该历史人物的身份和语气回信。回信要真诚、有深度，体现历史人物的性格特点。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );

    if (response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('AI API返回格式错误');
  }

  /**
   * 调用DeepSeek API
   */
  async callDeepSeek(prompt) {
    const response = await axios.post(
      this.apiUrl || 'https://api.deepseek.com/v1/chat/completions',
      {
        model: process.env.AI_MODEL || 'deepseek-chat',
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
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('AI API返回格式错误');
  }

  /**
   * 调用通义千问API
   */
  async callQwen(prompt) {
    const response = await axios.post(
      this.apiUrl || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: process.env.AI_MODEL || 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一位历史人物，需要以该历史人物的身份和语气回信。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
          temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data.output && response.data.output.text) {
      return response.data.output.text.trim();
    }
    throw new Error('AI API返回格式错误');
  }

  /**
   * 生成模拟回信（当AI服务不可用时使用）
   */
  generateFallbackReply(letterData, figureData) {
    return `亲爱的朋友，\n\n感谢你的来信。作为${figureData.name}，我很高兴能收到你的问候。\n\n${letterData.content}\n\n你的来信让我深感欣慰。希望你能继续传承我们的精神，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n${figureData.name}\n${new Date().toLocaleDateString('zh-CN')}`;
  }
}

module.exports = new AIService();

