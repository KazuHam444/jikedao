# AI回信功能配置指南

## 📋 当前状态

如果你看到的是模板回信，说明AI API还没有正确配置。按照以下步骤配置即可使用真实的AI生成回信。

---

## 🔧 配置步骤

### 方法一：使用OpenAI（推荐，需要付费）

1. **获取API密钥**
   - 访问 https://platform.openai.com/api-keys
   - 注册/登录账号
   - 创建新的API密钥

2. **配置环境变量**
   
   在项目根目录的 `.env` 文件中添加：
   ```env
   # OpenAI配置
   AI_API_KEY=sk-your-openai-api-key-here
   AI_API_URL=https://api.openai.com/v1/chat/completions
   AI_PROVIDER=openai
   AI_MODEL=gpt-3.5-turbo
   AI_MAX_TOKENS=1000
   AI_TEMPERATURE=0.7
   ```

3. **重启后端服务**
   ```bash
   # 停止当前服务，然后重新启动
   npm run dev
   ```

---

### 方法二：使用DeepSeek（国内可用，价格便宜）

1. **获取API密钥**
   - 访问 https://platform.deepseek.com/
   - 注册账号
   - 获取API密钥

2. **配置环境变量**
   ```env
   # DeepSeek配置
   AI_API_KEY=your-deepseek-api-key
   AI_API_URL=https://api.deepseek.com/v1/chat/completions
   AI_PROVIDER=deepseek
   AI_MODEL=deepseek-chat
   AI_MAX_TOKENS=1000
   AI_TEMPERATURE=0.7
   ```

---

### 方法三：使用通义千问（阿里云）

1. **获取API密钥**
   - 访问 https://dashscope.aliyun.com/
   - 注册阿里云账号
   - 开通通义千问服务
   - 获取API密钥

2. **配置环境变量**
   ```env
   # 通义千问配置
   AI_API_KEY=your-qwen-api-key
   AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
   AI_PROVIDER=qwen
   AI_MODEL=qwen-turbo
   AI_MAX_TOKENS=1000
   AI_TEMPERATURE=0.7
   ```

---

### 方法四：使用其他AI服务

如果你使用其他AI服务，需要：

1. **修改 `utils/aiService.js`**
   - 添加新的服务提供商方法
   - 在 `generateReply` 方法中添加对应的case

2. **配置环境变量**
   ```env
   AI_API_KEY=your-api-key
   AI_API_URL=your-api-url
   AI_PROVIDER=your-provider
   ```

---

## 📝 完整配置示例

在 `.env` 文件中的完整配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=cross_time_post

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# AI API配置（选择一种）
# ===== OpenAI =====
AI_API_KEY=sk-your-openai-key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_PROVIDER=openai
AI_MODEL=gpt-3.5-turbo

# ===== DeepSeek =====
# AI_API_KEY=your-deepseek-key
# AI_API_URL=https://api.deepseek.com/v1/chat/completions
# AI_PROVIDER=deepseek
# AI_MODEL=deepseek-chat

# ===== 通义千问 =====
# AI_API_KEY=your-qwen-key
# AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# AI_PROVIDER=qwen
# AI_MODEL=qwen-turbo

# AI参数配置
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
```

---

## ✅ 验证配置

配置完成后：

1. **重启后端服务**
   ```bash
   npm run dev
   ```

2. **测试生成回信**
   - 登录网站
   - 写一封信
   - 点击"生成回信"
   - 查看回信内容是否是根据你的信件内容生成的

3. **查看后端日志**
   - 如果看到 `✅ 成功使用AI生成回信`，说明配置成功
   - 如果看到 `⚠️ 使用模拟回信`，说明配置有问题

---

## 🔍 故障排查

### 问题1：仍然显示模板回信

**检查：**
1. `.env` 文件是否存在
2. `AI_API_KEY` 和 `AI_API_URL` 是否配置
3. 后端服务是否重启
4. 查看后端控制台是否有错误信息

### 问题2：AI API调用失败

**可能原因：**
- API密钥错误
- API URL不正确
- 网络连接问题
- API额度用完

**解决方法：**
- 检查API密钥是否正确
- 检查网络连接
- 查看后端控制台的错误信息
- 确认API账户有余额

### 问题3：回信内容不符合预期

**调整参数：**
- `AI_TEMPERATURE`: 控制创造性（0-1，越高越有创造性）
- `AI_MAX_TOKENS`: 控制回信长度
- 修改历史人物的 `prompt_template` 来调整回信风格

---

## 💡 提示

1. **免费额度**：大多数AI服务都有免费试用额度
2. **成本控制**：设置合理的 `AI_MAX_TOKENS` 来控制成本
3. **回信质量**：在数据库中为历史人物设置详细的 `biography` 和 `prompt_template` 可以提高回信质量
4. **备用方案**：如果AI服务不可用，系统会自动使用模拟回信，不会报错

---

## 🎯 推荐配置

### 开发环境
- 使用 DeepSeek（价格便宜，国内可用）
- 或使用 OpenAI 的免费试用

### 生产环境
- 根据预算选择合适的服务
- 建议使用 OpenAI GPT-3.5-turbo（性价比高）
- 或 DeepSeek（国内访问快）

---

## 📞 需要帮助？

如果配置遇到问题：
1. 检查后端控制台的错误日志
2. 确认 `.env` 文件配置正确
3. 测试API密钥是否有效（可以使用curl或Postman测试）
4. 查看AI服务提供商的文档

配置完成后，回信将根据你的信件内容真实生成，而不是使用模板！

