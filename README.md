# 跨时空邮局后端服务

这是一个基于 Node.js 和 Express 的后端服务，用于"跨时空邮局"网站项目。

## 功能特性

- ✅ 用户注册和登录（JWT认证）
- ✅ 管理员登录和管理
- ✅ 信件管理（创建、查看、更新、删除）
- ✅ AI自动生成回信
- ✅ 历史人物管理
- ✅ 样式配置管理
- ✅ 管理员精选信件功能
- ✅ 用户数据统计

## 技术栈

- Node.js
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- bcryptjs (密码加密)
- express-validator (数据验证)
- axios (AI API调用)

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`，并修改相应的配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=cross_time_post

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d

PORT=3000
NODE_ENV=development

# AI API配置（可选，用于生成回信）
AI_API_KEY=your-ai-api-key
AI_API_URL=https://api.openai.com/v1/chat/completions
```

### 3. 初始化数据库

**方式 A：一键初始化（推荐新项目）**

```bash
# 导入完整数据库结构和示例数据
mysql -u root -p --default-character-set=utf8mb4 < complete-schema.sql
```

**方式 B：使用迁移脚本**

```bash
npm run migrate:likes
npm run migrate:comments
```

详细说明请参考 [DATABASE_SETUP.md](DATABASE_SETUP.md)。

### 4. 初始化数据（可选）

```bash
# 初始化示例历史人物和样式配置
npm run init-data

# 创建管理员账户
npm run create-admin
```

### 5. 启动服务

```bash
# 开发模式（使用nodemon，自动重启）
npm run dev

# 生产模式
npm start
```

服务启动后，默认运行在 `http://localhost:3000`

---

## 使用 Postman 测试接口

### 准备工作

#### 1. 安装 Postman

如果还没有安装 Postman，请从 [Postman官网](https://www.postman.com/downloads/) 下载并安装。

#### 2. 创建 Postman 环境

1. 打开 Postman，点击右上角的 **"Environments"** 或 **"环境"**
2. 点击 **"+"** 创建新环境
3. 命名为 "跨时空邮局"
4. 添加以下变量：

| 变量名 | 初始值 | 当前值 |
|--------|--------|--------|
| `base_url` | http://localhost:3000 | http://localhost:3000 |
| `user_token` | (留空) | (留空) |
| `admin_token` | (留空) | (留空) |
| `user_id` | (留空) | (留空) |
| `letter_id` | (留空) | (留空) |
| `figure_id` | (留空) | (留空) |

5. 点击 **"Save"** 保存环境
6. 在右上角选择刚创建的环境

#### 3. 创建 Postman Collection

1. 点击左侧的 **"Collections"** 或 **"集合"**
2. 点击 **"+"** 创建新集合
3. 命名为 "跨时空邮局API"
4. 在集合上右键，选择 **"Add Folder"** 创建以下文件夹：
   - 认证相关
   - 用户相关
   - 信件相关
   - 回信相关
   - 历史人物相关
   - 样式配置相关
   - 管理员相关

---

## 接口测试步骤

### 一、认证相关接口

#### 1.1 用户注册

**步骤：**
1. 在 Postman 中创建新请求
2. 方法选择：**POST**
3. URL：`{{base_url}}/api/auth/register`
4. 在 **Headers** 标签页添加：
   - Key: `Content-Type`
   - Value: `application/json`
5. 在 **Body** 标签页：
   - 选择 **raw**
   - 选择 **JSON**
   - 输入以下内容：
   ```json
   {
     "username": "testuser",
     "password": "123456",
     "email": "test@example.com"
   }
   ```
6. 点击 **Send** 发送请求

**预期响应：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user_id": 1,
    "username": "testuser"
  }
}
```

**注意事项：**
- 用户名长度必须在3-50个字符之间
- 密码长度至少6个字符
- 邮箱格式必须有效
- 用户名和邮箱不能重复

---

#### 1.2 用户登录

**步骤：**
1. 创建新请求，方法：**POST**
2. URL：`{{base_url}}/api/auth/login`
3. **Headers** 添加 `Content-Type: application/json`
4. **Body** (raw, JSON)：
   ```json
   {
     "username": "testuser",
     "password": "123456"
   }
   ```
5. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

**重要：保存 Token**
1. 在响应中复制 `token` 的值
2. 在 Postman 环境中，将 `user_token` 的值设置为这个 token
3. 或者使用 Postman 的 **Tests** 标签页自动保存：
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       if (jsonData.success && jsonData.data.token) {
           pm.environment.set("user_token", jsonData.data.token);
           pm.environment.set("user_id", jsonData.data.user.user_id);
       }
   }
   ```

---

#### 1.3 管理员登录

**步骤：**
1. 创建新请求，方法：**POST**
2. URL：`{{base_url}}/api/auth/admin/login`
3. **Headers** 添加 `Content-Type: application/json`
4. **Body** (raw, JSON)：
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
   （使用你创建的管理员账户）

**预期响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "admin_id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "super_admin"
    }
  }
}
```

**保存管理员 Token：**
在 **Tests** 标签页添加：
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.token) {
        pm.environment.set("admin_token", jsonData.data.token);
    }
}
```

---

### 二、用户相关接口

#### 2.1 获取当前用户信息

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/users/me`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{user_token}}`
4. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 三、历史人物相关接口

#### 3.1 获取历史人物列表

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/figures`
3. 无需认证，直接点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "figure_id": 1,
      "name": "李白",
      "era": "唐朝",
      "biography": "李白（701年—762年）...",
      "avatar_url": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**保存历史人物ID：**
在 **Tests** 标签页添加：
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.length > 0) {
        pm.environment.set("figure_id", jsonData.data[0].figure_id);
    }
}
```

---

#### 3.2 获取历史人物详情

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/figures/{{figure_id}}`
   （或直接使用数字，如 `/api/figures/1`）
3. 点击 **Send**

---

### 四、样式配置相关接口

#### 4.1 获取样式配置

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/styles`
   - 获取所有样式：`{{base_url}}/api/styles`
   - 获取信纸样式：`{{base_url}}/api/styles?type=paper`
   - 获取字体样式：`{{base_url}}/api/styles?type=font`
   - 获取边框样式：`{{base_url}}/api/styles?type=border`
3. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": {
    "paper": [...],
    "font": [...],
    "border": [...]
  }
}
```

---

### 五、信件相关接口

#### 5.1 创建信件

**步骤：**
1. 创建新请求，方法：**POST**
2. URL：`{{base_url}}/api/letters`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{user_token}}`
4. **Body** (raw, JSON)：
   ```json
   {
     "figure_id": 1,
     "title": "致李白的一封信",
     "content": "尊敬的李白先生，您好！我是一名现代人，非常仰慕您的诗歌才华...",
     "paper_style": "default",
     "font_style": "default",
     "border_style": "default",
     "is_public": true
   }
   ```
5. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "message": "信件创建成功",
  "data": {
    "letter_id": 1
  }
}
```

**保存信件ID：**
在 **Tests** 标签页添加：
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.letter_id) {
        pm.environment.set("letter_id", jsonData.data.letter_id);
    }
}
```

---

#### 5.2 获取公开信件列表（首页展示）

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/letters/public?page=1&limit=10`
3. 无需认证，直接点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": {
    "letters": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

#### 5.3 获取用户自己的信件列表

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/letters/my-letters?page=1&limit=10`
3. **Headers** 添加：
   - `Authorization: Bearer {{user_token}}`
4. 点击 **Send**

---

#### 5.4 获取信件详情

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/letters/{{letter_id}}`
3. 如果是公开信件，无需认证；如果是私有信件，需要添加：
   - `Authorization: Bearer {{user_token}}`
4. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": {
    "letter": {
      "letter_id": 1,
      "title": "致李白的一封信",
      "content": "...",
      "paper_style": "default",
      "font_style": "default",
      "border_style": "default",
      "is_public": true,
      "is_featured": false,
      "writing_date": "2024-01-01T00:00:00.000Z",
      "status": "sent",
      "username": "testuser",
      "figure_name": "李白",
      "era": "唐朝"
    },
    "reply": null
  }
}
```

---

#### 5.5 更新信件

**步骤：**
1. 创建新请求，方法：**PUT**
2. URL：`{{base_url}}/api/letters/{{letter_id}}`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{user_token}}`
4. **Body** (raw, JSON)：
   ```json
   {
     "title": "修改后的标题",
     "is_public": false
   }
   ```
   （所有字段都是可选的，只需传入要修改的字段）
5. 点击 **Send**

---

#### 5.6 删除信件

**步骤：**
1. 创建新请求，方法：**DELETE**
2. URL：`{{base_url}}/api/letters/{{letter_id}}`
3. **Headers** 添加：
   - `Authorization: Bearer {{user_token}}`
4. 点击 **Send**

---

### 六、回信相关接口

#### 6.1 生成AI回信

**步骤：**
1. 创建新请求，方法：**POST**
2. URL：`{{base_url}}/api/replies/generate/{{letter_id}}`
3. **Headers** 添加：
   - `Authorization: Bearer {{user_token}}`
4. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "message": "回信生成成功",
  "data": {
    "reply_id": 1,
    "content": "亲爱的朋友，\n\n感谢你的来信..."
  }
}
```

**注意事项：**
- 每个信件只能生成一次回信
- 必须是信件作者才能生成回信
- 如果未配置AI API，会使用模拟回信

---

#### 6.2 获取回信

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/replies/{{letter_id}}`
3. 如果是公开信件的回信，无需认证；如果是私有信件的回信，需要添加：
   - `Authorization: Bearer {{user_token}}`
4. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": {
    "reply_id": 1,
    "letter_id": 1,
    "content": "亲爱的朋友，\n\n感谢你的来信...",
    "ai_model": "gpt-3.5-turbo",
    "reply_date": "2024-01-01T00:00:00.000Z",
    "sentiment_analysis": "positive"
  }
}
```

---

### 七、管理员相关接口

#### 7.1 获取用户列表

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/admin/users?page=1&limit=20&search=test`
   - `page`: 页码（可选）
   - `limit`: 每页数量（可选）
   - `search`: 搜索关键词（可选）
3. **Headers** 添加：
   - `Authorization: Bearer {{admin_token}}`
4. 点击 **Send**

---

#### 7.2 获取信件列表（管理员）

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/admin/letters?page=1&limit=20&status=sent&is_public=true&is_featured=false`
   - `status`: 信件状态（draft, sent, replied）
   - `is_public`: 是否公开（true/false）
   - `is_featured`: 是否精选（true/false）
3. **Headers** 添加：
   - `Authorization: Bearer {{admin_token}}`
4. 点击 **Send**

---

#### 7.3 设置信件为精选

**步骤：**
1. 创建新请求，方法：**PUT**
2. URL：`{{base_url}}/api/admin/letters/{{letter_id}}/feature`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
4. **Body** (raw, JSON)：
   ```json
   {
     "is_featured": true
   }
   ```
5. 点击 **Send**

**注意事项：**
- 只有公开信件才能被设置为精选
- 精选信件会在首页展示

---

#### 7.4 设置用户状态

**步骤：**
1. 创建新请求，方法：**PUT**
2. URL：`{{base_url}}/api/admin/users/{{user_id}}/status`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
   （需要超级管理员权限）
4. **Body** (raw, JSON)：
   ```json
   {
     "is_active": false
   }
   ```
5. 点击 **Send**

---

#### 7.5 获取统计数据

**步骤：**
1. 创建新请求，方法：**GET**
2. URL：`{{base_url}}/api/admin/statistics`
3. **Headers** 添加：
   - `Authorization: Bearer {{admin_token}}`
4. 点击 **Send**

**预期响应：**
```json
{
  "success": true,
  "data": {
    "users": 100,
    "letters": 500,
    "replies": 450,
    "featured_letters": 50,
    "public_letters": 300,
    "historical_figures": 10
  }
}
```

---

#### 7.6 创建历史人物

**步骤：**
1. 创建新请求，方法：**POST**
2. URL：`{{base_url}}/api/admin/figures`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
4. **Body** (raw, JSON)：
   ```json
   {
     "name": "杜甫",
     "era": "唐朝",
     "biography": "杜甫（712年—770年），字子美，自号少陵野老...",
     "avatar_url": "https://example.com/avatar.jpg",
     "prompt_template": "你是唐代诗人杜甫，字子美..."
   }
   ```
5. 点击 **Send**

---

#### 7.7 更新历史人物

**步骤：**
1. 创建新请求，方法：**PUT**
2. URL：`{{base_url}}/api/admin/figures/{{figure_id}}`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
4. **Body** (raw, JSON)：
   ```json
   {
     "name": "修改后的姓名",
     "biography": "修改后的简介"
   }
   ```
   （所有字段都是可选的）
5. 点击 **Send**

---

#### 7.8 创建样式配置

**步骤：**
1. 创建新请求，方法：**POST**
2. URL：`{{base_url}}/api/admin/styles`
3. **Headers** 添加：
   - `Content-Type: application/json`
   - `Authorization: Bearer {{admin_token}}`
4. **Body** (raw, JSON)：
   ```json
   {
     "style_type": "paper",
     "style_name": "古典信纸",
     "style_value": "classic",
     "preview_url": "https://example.com/preview.jpg"
   }
   ```
   - `style_type`: 必须是 "paper"、"font" 或 "border"
5. 点击 **Send**

---

## 测试流程建议

### 完整测试流程

1. **准备阶段**
   - 启动服务器
   - 初始化数据（历史人物、样式配置）
   - 创建管理员账户

2. **用户功能测试**
   - 用户注册
   - 用户登录（保存token）
   - 获取当前用户信息
   - 获取历史人物列表
   - 获取样式配置
   - 创建信件
   - 获取自己的信件列表
   - 获取信件详情
   - 生成AI回信
   - 获取回信
   - 更新信件
   - 删除信件

3. **管理员功能测试**
   - 管理员登录（保存token）
   - 获取用户列表
   - 获取信件列表
   - 设置信件为精选
   - 获取统计数据
   - 创建历史人物
   - 更新历史人物
   - 创建样式配置

---

## 常见问题

### 1. Token 过期

如果收到 `401` 错误，提示"令牌已过期"，需要重新登录获取新的 token。

### 2. 权限不足

- 如果收到 `403` 错误，检查：
  - 是否使用了正确的 token（用户token vs 管理员token）
  - 是否是资源的所有者（如修改信件）
  - 是否具有足够的权限（如超级管理员权限）

### 3. 数据库连接失败

检查：
- MySQL服务是否运行
- `.env` 文件中的数据库配置是否正确
- 数据库 `cross_time_post` 是否已创建

### 4. 接口返回 404

检查：
- URL 是否正确
- 服务器是否正在运行
- 端口号是否为 3000

---

## 数据库说明

项目使用MySQL数据库，包含以下表：
- `users` - 用户表
- `historical_figures` - 历史人物表
- `letters` - 信件表
- `replies` - 回信表
- `admins` - 管理员表
- `style_configs` - 样式配置表

---

## 注意事项

1. **生产环境配置**
   - 务必修改 `JWT_SECRET` 为强随机字符串
   - 使用环境变量管理敏感信息
   - 启用HTTPS

2. **AI回信功能**
   - 需要配置 `AI_API_KEY` 和 `AI_API_URL` 才能使用真实AI
   - 如果不配置，会使用模拟回信

3. **密码安全**
   - 密码使用 bcrypt 加密存储
   - 建议密码长度至少8位，包含字母和数字

4. **Token管理**
   - Token默认有效期为7天
   - 可以在 `.env` 中修改 `JWT_EXPIRE`

---

## 更多信息

详细的API接口文档请查看 [API.md](./API.md)

---

## 开发建议

1. 首次运行前，确保数据库已创建并执行建表语句
2. 使用 `npm run init-data` 初始化示例数据
3. 使用 `npm run create-admin` 创建管理员账户
4. 建议按照上述测试流程逐步测试每个接口
5. 使用 Postman Collection 组织和管理所有接口

---

## 技术支持

如有问题，请检查：
1. 服务器日志输出
2. 数据库连接状态
3. 环境变量配置
4. API响应错误信息
