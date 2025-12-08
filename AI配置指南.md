# AI回信功能配置指南

## 📋 当前状态

如果你看到的是模板回信，说明AI API还没有正确配置。按照以下步骤配置即可使用真实的AI生成回信。

---

## 🔧 配置步骤

## 🔐 安全注意事项

- **不要在公开场合粘贴或发布你的 API 密钥。** 如果你不小心泄露了密钥（例如在聊天、帖子或公有仓库中），请立即在 DeepSeek（或对应服务）控制台撤销/删除该密钥并创建新密钥。
- **不要将生产密钥提交到代码仓库。** 使用 `.env` 或 CI/CD 的机密管理来保存密钥。
- 本仓库已提供 `.env.example` 作为示例，实际密钥请写入项目根目录的 `.env` 文件或通过系统/主机的环境变量注入。


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

3. **PowerShell（临时会话）设置示例**

```powershell
$env:AI_PROVIDER='deepseek'; $env:AI_API_KEY='your-deepseek-api-key'; $env:AI_API_URL='https://api.deepseek.com/v1/chat/completions'
```

> 提示：更推荐在项目根目录创建 `.env`（并把真实密钥写入），仓库中保留 `.env.example`，并确保 `.gitignore` 忽略 `.env`。

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

   ## 🆕 新增功能说明（快速浏览）

   - **写信页面预览**：在写信页（`/write`）新增“预览信纸”按钮，可以实时查看所选的信纸、字体与边框效果，包含信封与纸张展示。
   - **回信管理**：在主菜单新增“回信”页面（`/replies`），用户可以查看自己写过的信并对未生成回信的信件单条或批量触发 AI 生成回信。
   - **点赞与通知**：为精选/公开信件新增点赞功能，点赞会记录在 `likes` 表并为作者创建通知（`notifications` 表）；用户在主页可点击通知图标查看未读通知并跳转查看详情。

   ### 数据库迁移（开发/测试）

   新增的表需要在数据库中创建一次（只需运行一次）：

   ```powershell
   cd "D:\ VS Code\jikedao"
   npm run migrate:likes
   ```

   该脚本会创建 `likes` 与 `notifications` 表（如已存在则跳过）。

   ### 前端验证要点

   - 写信页（`/write`）：选择不同样式后点击“预览信纸”查看效果并确认无误；发送后会保存所选样式信息到信件记录。
   - 回信页（`/replies`）：可单条或多选批量生成回信，生成结果会更新信件状态（`has_reply` 或 `status`）。
   - 首页精选信件：卡片右上角有点赞按钮，点击会改变计数并为作者创建通知；通知页（`/notifications`）可查看并标记已读。

   ---

   ### 新增 API 概览

   - `POST /api/likes/toggle`：切换点赞（需登录），参数 `{ letter_id }`。
   - `GET /api/likes/count/:letterId`：获取某信件点赞数。
   - `POST /api/comments`：新增评论（需登录），参数 `{ letter_id, content }`。
   - `GET /api/comments/letter/:letterId`：获取信件评论列表。
   - `GET /api/notifications`：获取当前用户通知（需登录）。
   - `POST /api/notifications/mark-read`：标记通知为已读，参数 `{ ids: [id1,id2] }`。

   (更多 API 详情和示例可移动到单独的 API 文档文件或 README 中。)


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

