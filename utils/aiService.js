const axios = require('axios');

/**
 * AI服务配置
 * 支持多种AI服务提供商
 */
class AIService {
  // 获取配置（每次调用时重新读取，确保环境变量已加载）
  getConfig() {
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
    return {
      apiKey: key,
      apiUrl: process.env.AI_API_URL,
      provider: (process.env.AI_PROVIDER || 'openai').toLowerCase()
    };
  }

  // 兼容旧代码的属性访问
  get apiKey() {
    return this.getConfig().apiKey;
  }

  get apiUrl() {
    return this.getConfig().apiUrl;
  }

  get provider() {
    return this.getConfig().provider;
  }

  /**
   * 生成回信内容
   * @param {Object} letterData - 信件数据
   * @param {Object} figureData - 历史人物数据
   * @returns {Promise<string>} 回信内容
   */
  async generateReply(letterData, figureData) {
    // 获取配置（每次调用时重新读取）
    const config = this.getConfig();
    
    // 检查是否配置了AI API
    if (!config.apiKey || !config.apiUrl) {
      throw new Error('AI_API_KEY 或 AI_API_URL 未配置，请查看配置说明');
    }

    // 构建提示词
    const prompt = this.buildPrompt(letterData, figureData);

    try {
      switch (config.provider) {
        case 'openai':
          return await this.callOpenAI(prompt, config);
        case 'deepseek':
          return await this.callDeepSeek(prompt, config);
        case 'qwen':
          return await this.callQwen(prompt, config);
        default:
          return await this.callOpenAI(prompt, config);
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
   * 调用OpenAI API（带重试机制）
   */
  async callOpenAI(prompt, config, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          config.apiUrl,
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
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
              'Accept-Encoding': 'gzip, deflate'
            },
            timeout: 60000, // 增加到60秒
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            decompress: true,
            responseType: 'json'
          }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
          return response.data.choices[0].message.content.trim();
        }
        throw new Error('AI API返回格式错误');
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.code === 'ETIMEDOUT' || 
                              error.code === 'ENOTFOUND' ||
                              error.message === 'aborted' ||
                              error.message.includes('aborted');

        if (isNetworkError && !isLastAttempt) {
          const waitTime = attempt * 2000;
          console.warn(`OpenAI API调用失败（尝试 ${attempt}/${retries}），${waitTime}ms后重试...`, error.message);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (error.response) {
          throw new Error(`OpenAI API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          throw new Error(`OpenAI API无响应: ${error.message || '连接超时或中断'}`);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * 调用DeepSeek API（带重试机制）
   */
  async callDeepSeek(prompt, config, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          config.apiUrl || 'https://api.deepseek.com/v1/chat/completions',
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
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
              'Accept-Encoding': 'gzip, deflate' // 明确指定压缩格式
            },
            timeout: 60000, // 增加到60秒
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            // 禁用自动解压缩，手动处理
            decompress: true,
            // 增加响应超时
            responseType: 'json'
          }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
          return response.data.choices[0].message.content.trim();
        }
        throw new Error('AI API返回格式错误');
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.code === 'ETIMEDOUT' || 
                              error.code === 'ENOTFOUND' ||
                              error.message === 'aborted' ||
                              error.message.includes('aborted');

        if (isNetworkError && !isLastAttempt) {
          // 网络错误，等待后重试
          const waitTime = attempt * 2000; // 递增等待时间：2秒、4秒、6秒
          console.warn(`DeepSeek API调用失败（尝试 ${attempt}/${retries}），${waitTime}ms后重试...`, error.message);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // 非网络错误或最后一次尝试，直接抛出
        if (error.response) {
          // API返回了错误响应
          throw new Error(`DeepSeek API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // 请求已发送但没有收到响应
          throw new Error(`DeepSeek API无响应: ${error.message || '连接超时或中断'}`);
        } else {
          // 其他错误
          throw error;
        }
      }
    }
  }

  /**
   * 调用通义千问API（带重试机制）
   */
  async callQwen(prompt, config, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          config.apiUrl || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
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
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
              'Accept-Encoding': 'gzip, deflate'
            },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            decompress: true,
            responseType: 'json'
          }
        );

        if (response.data && response.data.output && response.data.output.text) {
          return response.data.output.text.trim();
        }
        throw new Error('AI API返回格式错误');
      } catch (error) {
        const isLastAttempt = attempt === retries;
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.code === 'ETIMEDOUT' || 
                              error.code === 'ENOTFOUND' ||
                              error.message === 'aborted' ||
                              error.message.includes('aborted');

        if (isNetworkError && !isLastAttempt) {
          const waitTime = attempt * 2000;
          console.warn(`通义千问API调用失败（尝试 ${attempt}/${retries}），${waitTime}ms后重试...`, error.message);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (error.response) {
          throw new Error(`通义千问API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          throw new Error(`通义千问API无响应: ${error.message || '连接超时或中断'}`);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * 生成模拟回信（当AI服务不可用时使用）
   */
  generateFallbackReply(letterData, figureData) {
    return `亲爱的朋友，\n\n感谢你的来信。作为${figureData.name}，我很高兴能收到你的问候。\n\n${letterData.content}\n\n你的来信让我深感欣慰。希望你能继续传承我们的精神，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n${figureData.name}\n${new Date().toLocaleDateString('zh-CN')}`;
  }
}

module.exports = new AIService();

