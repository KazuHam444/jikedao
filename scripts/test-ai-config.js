const dotenv = require('dotenv');
const aiService = require('../utils/aiService');

// 加载环境变量
dotenv.config();

console.log('=== AI配置检查 ===\n');

console.log('AI_PROVIDER:', process.env.AI_PROVIDER || '未配置');
console.log('AI_API_KEY:', process.env.AI_API_KEY ? `已配置（长度：${process.env.AI_API_KEY.length}，前10位：${process.env.AI_API_KEY.substring(0, 10)}...）` : '未配置');
console.log('AI_API_URL:', process.env.AI_API_URL || '未配置');
console.log('AI_MODEL:', process.env.AI_MODEL || '未配置');
console.log('AI_MAX_TOKENS:', process.env.AI_MAX_TOKENS || '未配置');
console.log('AI_TEMPERATURE:', process.env.AI_TEMPERATURE || '未配置');

console.log('\n=== AI服务实例检查 ===\n');
console.log('aiService.apiKey:', aiService.apiKey ? `已加载（长度：${aiService.apiKey.length}）` : '未加载');
console.log('aiService.apiUrl:', aiService.apiUrl || '未加载');
console.log('aiService.provider:', aiService.provider || '未加载');

console.log('\n=== 配置状态 ===\n');
if (aiService.apiKey && aiService.apiUrl) {
  console.log('✅ AI配置已正确加载！');
  console.log('✅ 可以使用AI生成回信');
} else {
  console.log('❌ AI配置未正确加载');
  console.log('请检查：');
  console.log('1. .env文件是否存在');
  console.log('2. .env文件中是否配置了AI_API_KEY和AI_API_URL');
  console.log('3. 后端服务是否已重启（修改.env后需要重启）');
}

