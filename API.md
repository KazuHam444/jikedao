# API接口文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 认证方式: JWT Token
- 请求头格式: `Authorization: Bearer <token>` 或 `x-access-token: <token>`

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "errors": [] // 可选，验证错误详情
}
```

---

## 1. 认证接口

### 1.1 用户注册
- **URL**: `/api/auth/register`
- **方法**: `POST`
- **认证**: 否
- **请求体**:
```json
{
  "username": "用户名（3-50字符）",
  "password": "密码（至少6字符）",
  "email": "email@example.com"
}
```

### 1.2 用户登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **认证**: 否
- **请求体**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt-token",
    "user": {
      "user_id": 1,
      "username": "用户名",
      "email": "email@example.com"
    }
  }
}
```

### 1.3 管理员登录
- **URL**: `/api/auth/admin/login`
- **方法**: `POST`
- **认证**: 否
- **请求体**: 同用户登录
- **响应**: 返回管理员信息和token

---

## 2. 用户接口

### 2.1 获取当前用户信息
- **URL**: `/api/users/me`
- **方法**: `GET`
- **认证**: 是（用户）

---

## 3. 信件接口

### 3.1 获取公开信件列表（首页展示）
- **URL**: `/api/letters/public`
- **方法**: `GET`
- **认证**: 否
- **查询参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）

### 3.2 获取用户自己的信件列表
- **URL**: `/api/letters/my-letters`
- **方法**: `GET`
- **认证**: 是（用户）
- **查询参数**: 同3.1

### 3.3 获取信件详情
- **URL**: `/api/letters/:letterId`
- **方法**: `GET`
- **认证**: 条件（公开信件无需认证，私有信件需要认证且必须是作者）

### 3.4 创建信件
- **URL**: `/api/letters`
- **方法**: `POST`
- **认证**: 是（用户）
- **请求体**:
```json
{
  "figure_id": 1,
  "title": "信件标题",
  "content": "信件内容",
  "paper_style": "default",
  "font_style": "default",
  "border_style": "default",
  "is_public": false
}
```

### 3.5 更新信件
- **URL**: `/api/letters/:letterId`
- **方法**: `PUT`
- **认证**: 是（用户，且必须是作者）
- **请求体**: 同3.4（所有字段可选）

### 3.6 删除信件
- **URL**: `/api/letters/:letterId`
- **方法**: `DELETE`
- **认证**: 是（用户，且必须是作者）

---

## 4. 回信接口

### 4.1 生成AI回信
- **URL**: `/api/replies/generate/:letterId`
- **方法**: `POST`
- **认证**: 是（用户，且必须是信件作者）
- **说明**: 为指定信件生成AI回信，每个信件只能生成一次回信

### 4.2 获取回信
- **URL**: `/api/replies/:letterId`
- **方法**: `GET`
- **认证**: 条件（公开信件的回信无需认证，私有信件的回信需要认证且必须是作者）

---

## 5. 历史人物接口

### 5.1 获取历史人物列表
- **URL**: `/api/figures`
- **方法**: `GET`
- **认证**: 否

### 5.2 获取历史人物详情
- **URL**: `/api/figures/:figureId`
- **方法**: `GET`
- **认证**: 否

---

## 6. 样式配置接口

### 6.1 获取样式配置
- **URL**: `/api/styles`
- **方法**: `GET`
- **认证**: 否
- **查询参数**:
  - `type`: 样式类型（可选：paper, font, border）
- **响应**: 如果指定type，返回该类型的样式列表；否则返回按类型分组的对象

---

## 7. 管理员接口

### 7.1 获取用户列表
- **URL**: `/api/admin/users`
- **方法**: `GET`
- **认证**: 是（管理员）
- **查询参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认20）
  - `search`: 搜索关键词（可选）

### 7.2 获取信件列表
- **URL**: `/api/admin/letters`
- **方法**: `GET`
- **认证**: 是（管理员）
- **查询参数**:
  - `page`: 页码
  - `limit`: 每页数量
  - `status`: 信件状态（draft, sent, replied）
  - `is_public`: 是否公开（true/false）
  - `is_featured`: 是否精选（true/false）

### 7.3 设置信件为精选
- **URL**: `/api/admin/letters/:letterId/feature`
- **方法**: `PUT`
- **认证**: 是（管理员）
- **请求体**:
```json
{
  "is_featured": true
}
```
- **说明**: 只有公开信件才能被设置为精选

### 7.4 设置用户状态
- **URL**: `/api/admin/users/:userId/status`
- **方法**: `PUT`
- **认证**: 是（超级管理员）
- **请求体**:
```json
{
  "is_active": false
}
```

### 7.5 获取统计数据
- **URL**: `/api/admin/statistics`
- **方法**: `GET`
- **认证**: 是（管理员）
- **响应**:
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

### 7.6 创建历史人物
- **URL**: `/api/admin/figures`
- **方法**: `POST`
- **认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "历史人物姓名",
  "era": "时代",
  "biography": "生平简介",
  "avatar_url": "头像URL（可选）",
  "prompt_template": "AI提示词模板（可选）"
}
```

### 7.7 更新历史人物
- **URL**: `/api/admin/figures/:figureId`
- **方法**: `PUT`
- **认证**: 是（管理员）
- **请求体**: 同7.6（所有字段可选）

### 7.8 创建样式配置
- **URL**: `/api/admin/styles`
- **方法**: `POST`
- **认证**: 是（管理员）
- **请求体**:
```json
{
  "style_type": "paper",
  "style_name": "样式名称",
  "style_value": "样式值",
  "preview_url": "预览图URL（可选）"
}
```

---

## 状态码说明

- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 使用示例

### 用户注册并创建信件

```javascript
// 1. 注册
const registerRes = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123',
    email: 'test@example.com'
  })
});

// 2. 登录
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
});
const { data: { token } } = await loginRes.json();

// 3. 创建信件
const letterRes = await fetch('http://localhost:3000/api/letters', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    figure_id: 1,
    title: '致李白的一封信',
    content: '尊敬的李白先生...',
    is_public: true
  })
});

// 4. 生成回信
const { data: { letter_id } } = await letterRes.json();
await fetch(`http://localhost:3000/api/replies/generate/${letter_id}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

