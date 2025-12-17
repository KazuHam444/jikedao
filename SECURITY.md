# 安全性文档

本文档详细说明跨时空邮局后端服务的安全实现机制。

---

## 目录

1. [SQL防注入](#sql防注入)
2. [密码加密](#密码加密)
3. [认证和授权](#认证和授权)
4. [输入验证](#输入验证)
5. [最佳实践](#最佳实践)

---

## SQL防注入

### 概述

SQL注入是一种常见的网络攻击方式，通过在SQL查询中插入恶意代码来绕过应用程序的安全防护。本项目采用**参数化查询**（Prepared Statements）完全防止SQL注入攻击。

### 实现机制

#### 1. 参数化查询基础

所有数据库查询都使用 `mysql2` 库的参数化接口，通过占位符 `?` 和参数数组方式实现。

**文件：[config/database.js](config/database.js)**

```javascript
const promisePool = pool.promise();

module.exports = {
  query: (sql, params) => {
    return promisePool.query(sql, params);  // ✅ 参数化查询
  }
};
```

#### 2. 安全的查询模式

**正确做法 ✅** - 参数通过数组传递：

```javascript
// ✅ 安全：参数化查询
const [users] = await query(
  'SELECT user_id FROM users WHERE username = ? OR email = ?',
  [username, email]  // 参数通过数组传递
);
```

**错误做法 ❌** - 字符串拼接（项目中未使用）：

```javascript
// ❌ 不安全：字符串拼接
const sql = `SELECT * FROM users WHERE username = '${username}'`;
await query(sql);  // 容易被SQL注入
```

### 实现示例

#### 用户认证中的参数化查询

**文件：[routes/auth.js](routes/auth.js#L40)**

```javascript
// 用户注册 - INSERT查询
const [result] = await query(
  'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
  [username, passwordHash, email]  // ✅ 所有值都参数化
);

// 用户登录 - SELECT查询
const [users] = await query(
  'SELECT user_id, username, password_hash FROM users WHERE username = ?',
  [username]  // ✅ 参数化
);
```

#### 信件操作中的参数化查询

**文件：[routes/letters.js](routes/letters.js)**

```javascript
// 创建信件
const [result] = await query(`
  INSERT INTO letters 
  (user_id, figure_id, title, content, paper_style, font_style, border_style, font_color, is_public, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [userId, figure_id, title, content, paper_style, font_style, border_style, font_color, is_public, 'draft']);

// 删除信件
await query('DELETE FROM letters WHERE letter_id = ?', [letterId]);
```

#### 动态SQL构建的安全处理

**文件：[routes/admin.js](routes/admin.js#L22-L42)**

虽然使用了动态SQL，但仍然保持安全：

```javascript
let sql = `SELECT * FROM users WHERE 1=1`;
const params = [];

// ✅ 字段名硬编码（不参数化）
if (search) {
  sql += ' AND (username LIKE ? OR email LIKE ?)';
  // ✅ 参数值通过数组传递
  params.push(`%${search}%`, `%${search}%`);
}

// ✅ 参数数组传递给query函数
const [users] = await query(sql, params);
```

**关键原则：**
- ✅ 字段名**硬编码**在SQL模板中
- ✅ 列名**硬编码**在SQL模板中
- ✅ 用户输入的**值参数化**
- ❌ 永远不要拼接用户输入到SQL字符串中

### 防注入的工作原理

当使用参数化查询时，`mysql2` 库会：

1. **分离SQL结构和数据**
   - SQL模板在先，定义了查询的结构
   - 参数在后，仅作为数据值

2. **转义特殊字符**
   - SQL注入常用的特殊字符（如 `'`, `"`, `;` 等）会被自动转义
   - 确保用户输入被视为数据，而不是SQL代码

3. **示例对比**

| 类型 | 用户输入 | 结果 |
|------|---------|------|
| 参数化查询 | `' OR '1'='1` | 作为字符串值，不执行SQL代码 ✅ |
| 字符串拼接 | `' OR '1'='1` | 被解析为SQL逻辑，绕过认证 ❌ |

---

## 密码加密

### 加密库

项目使用 **bcryptjs** 进行密码加密，这是业界标准的密码存储方案。

**依赖：[package.json](package.json)**
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"
  }
}
```

### 注册时的密码加密

**文件：[routes/auth.js](routes/auth.js#L40)**

```javascript
// 加密密码（10轮盐值）
const passwordHash = await bcrypt.hash(password, 10);

// 存储的是加密哈希，不是明文
const [result] = await query(
  'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
  [username, passwordHash, email]
);
```

**关键特性：**
- ✅ 盐值轮数为10（安全与速度的平衡）
- ✅ 每次加密生成不同的哈希值（包含随机盐）
- ✅ 数据库中存储的是哈希值，不是原始密码

### 登录时的密码验证

**文件：[routes/auth.js](routes/auth.js#L104-L110)**

```javascript
// 获取用户的哈希密码
const [users] = await query(
  'SELECT user_id, username, password_hash FROM users WHERE username = ?',
  [username]
);

// 使用bcrypt.compare进行安全对比
const isPasswordValid = await bcrypt.compare(password, user.password_hash);

if (!isPasswordValid) {
  return res.status(401).json({
    success: false,
    message: '用户名或密码错误'
  });
}
```

**安全对比的优势：**
- ✅ 使用常数时间对比，防止时序攻击（timing attack）
- ✅ 返回布尔值，而非详细错误信息
- ✅ 模糊的错误提示（"用户名或密码错误"）防止用户枚举

### 管理员密码管理

**创建管理员 - [scripts/create-admin.js](scripts/create-admin.js#L59)**

```javascript
const passwordHash = await bcrypt.hash(password, 10);
await query(
  'INSERT INTO admins (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
  [username, passwordHash, email, role]
);
```

**管理员登录 - [routes/auth.js](routes/auth.js#L188-L194)**

```javascript
const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
```

### 数据库字段设计

**文件：[schema.sql](schema.sql)**

```sql
-- 用户表
CREATE TABLE users (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,  -- ✅ 存储bcrypt哈希值
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`user_id`)
);

-- 管理员表
CREATE TABLE admins (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,  -- ✅ 存储bcrypt哈希值
  `email` varchar(100) NOT NULL,
  `role` enum('super_admin','content_admin'),
  PRIMARY KEY (`admin_id`)
);
```

**字段容量说明：**
- `varchar(255)` 完全足够存储bcrypt哈希（通常60-72字符）
- 兼容bcrypt的所有前缀格式：`$2a$`, `$2b$`, `$2y$`

### 哈希值示例

实际存储的bcrypt哈希值格式：
```
$2a$10$tB4dQhI2UNmtinjw0H0e2.Ca8.PSv.5Cg6vu7nBnDRhiYtRSeK3Bi
```

解析：
- `$2a$` - bcrypt算法标识
- `10` - 工作因子（盐值轮数）
- 剩余部分 - 随机盐 + 加密哈希值

---

## 认证和授权

### JWT Token认证

所有受保护的API端点都使用JWT（JSON Web Token）进行认证。

**认证中间件 - [middleware/auth.js](middleware/auth.js)**

```javascript
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 验证用户是否存在且激活
    const [users] = await query(
      'SELECT user_id, username, email, is_active FROM users WHERE user_id = ?',
      [decoded.userId]  // ✅ 参数化查询
    );

    if (!users || users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};
```

### Token生成

**文件：[routes/auth.js](routes/auth.js#L118-L122)**

```javascript
const token = jwt.sign(
  { userId: user.user_id, username: user.username },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: process.env.JWT_EXPIRE || '7d' }  // 默认7天过期
);
```

### 管理员权限检查

**文件：[middleware/auth.js](middleware/auth.js)**

```javascript
const authenticateAdmin = async (req, res, next) => {
  // 类似的认证检查，但验证管理员权限
};

const authenticateSuperAdmin = async (req, res, next) => {
  // 验证是否为超级管理员
};
```

### Token过期配置

**文件：[.env.example](.env.example)**

```env
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=30d
```

建议在生产环境中：
- ✅ 使用强随机密钥生成 `JWT_SECRET`
- ✅ 根据业务需求调整 `JWT_EXPIRE`
- ✅ 定期轮换 JWT_SECRET

### 刷新令牌机制

为提升安全性与用户体验，后端实现了刷新令牌（Refresh Token）机制：

- 登录响应中会返回：`token`（访问令牌）与 `refresh_token`（刷新令牌）
- 新增端点：[POST /api/auth/refresh](routes/auth.js) 使用 `refresh_token` 换取新 `token`
- 支持用户与管理员两类身份，系统会根据刷新令牌载荷自动颁发对应类型的访问令牌

工作流程：
- 访问令牌短期有效（默认为 `JWT_EXPIRE=7d`）
- 刷新令牌长期有效（默认为 `JWT_REFRESH_EXPIRE=30d`），仅用于获取新访问令牌
- 刷新令牌使用单独密钥 `JWT_REFRESH_SECRET`，与访问令牌密钥分离

示例用法：
```bash
# 用户登录获取 token 与 refresh_token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"password123\"}"

# 使用刷新令牌换取新的访问令牌
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"<登录返回的refresh_token>\"}"

# 管理员登录与刷新
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"password123\"}"

curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"<管理员登录返回的refresh_token>\"}"
```

前端集成说明：
- 本次改动只新增响应字段 `refresh_token` 与刷新端点；不依赖前端改动即可保持现状工作。
- 若前端需要“静默续期”，可在 401/即将过期时调用 `/api/auth/refresh` 获取新 `token`，并继续原请求。

---

## 输入验证

### 使用express-validator

项目使用 `express-validator` 库进行全面的输入验证，在数据到达数据库之前就进行检查。

**依赖：[package.json](package.json)**
```json
{
  "dependencies": {
    "express-validator": "^7.0.1"
  }
}
```

### 注册时的验证

**文件：[routes/auth.js](routes/auth.js#L9-L20)**

```javascript
router.post('/register', [
  // ✅ 用户名验证
  body('username')
    .trim()                                    // 移除前后空格
    .isLength({ min: 3, max: 50 })            // 长度限制
    .withMessage('用户名长度必须在3-50个字符之间'),
  
  // ✅ 密码验证
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  
  // ✅ 邮箱验证
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '验证失败',
      errors: errors.array()
    });
  }
  // 继续处理已验证的数据
});
```

### 信件创建时的验证

**文件：[routes/letters.js](routes/letters.js#L203-L215)**

```javascript
router.post('/', authenticate, [
  body('figure_id').isInt().withMessage('请选择历史人物'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('标题长度必须在1-200个字符之间'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('信件内容不能为空'),
  body('paper_style').optional().isString(),
  body('font_style').optional().isString(),
  body('border_style').optional().isString(),
  body('is_public').optional().isBoolean()
], async (req, res) => {
  // 验证逻辑
});
```

### 验证的优势

| 验证类型 | 示例 | 作用 |
|---------|------|------|
| 类型检查 | `isInt()`, `isEmail()`, `isBoolean()` | 确保数据类型正确 |
| 长度限制 | `isLength({ min: 3, max: 50 })` | 防止超大输入 |
| 格式检查 | `isEmail()`, `matches()` | 确保格式符合规范 |
| 修饰符 | `trim()`, `escape()` | 清理输入数据 |

---

## 最佳实践

### 1. 环境变量管理

**生产环境建议：**

```env
# 不要在代码中硬编码敏感信息
JWT_SECRET=使用强随机字符串，至少32个字符
JWT_EXPIRE=根据业务需求调整，如24h或7d

# 数据库凭证
DB_HOST=使用环境变量，不要硬编码
DB_USER=使用环境变量，不要硬编码
DB_PASSWORD=使用强密码和环境变量

# 依赖关键字段
NODE_ENV=production
```

### 2. 错误处理

**避免暴露敏感信息：**

```javascript
// ✅ 好的做法 - 模糊的错误提示
return res.status(401).json({
  success: false,
  message: '用户名或密码错误'  // 不暴露用户是否存在
});

// ❌ 坏的做法 - 暴露信息
return res.status(401).json({
  success: false,
  message: '用户不存在'  // 泄露信息
});
```

### 3. HTTPS配置

**生产环境必须使用HTTPS：**

```javascript
// 配置HTTPS和安全头
const helmet = require('helmet');
app.use(helmet());

// 启用CORS
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  credentials: true
}));
```

### 4. 日志和监控

**记录安全相关事件：**

```javascript
// 记录失败的登录尝试
console.error('登录失败:', {
  username: username,
  timestamp: new Date(),
  ip: req.ip
});

// 记录异常活动
console.warn('异常访问:', {
  userId: req.user?.user_id,
  endpoint: req.path,
  timestamp: new Date()
});
```

### 5. 定期审计

**定期检查：**

- ✅ 依赖包更新（运行 `npm audit`）
- ✅ 访问日志分析
- ✅ 异常登录尝试
- ✅ 数据库备份完整性
- ✅ Token和密钥轮换

### 6. 部署清单

部署到生产环境前检查：

- [ ] `.env` 文件已配置正确
- [ ] 所有敏感信息已从代码中移除
- [ ] 数据库备份已创建
- [ ] HTTPS已启用
- [ ] JWT_SECRET已更改为强随机字符串
- [ ] 所有依赖包已更新到最新安全版本
- [ ] 错误日志已配置到文件或监控服务
- [ ] CORS已正确配置
- [ ] 数据库连接使用强密码

---

## 安全性总结

| 功能 | 实现方式 | 安全等级 |
|------|---------|--------|
| SQL防注入 | 参数化查询 | 🔒 高 |
| 密码存储 | bcryptjs加密 | 🔒 高 |
| 认证 | JWT Token | 🔒 高 |
| 输入验证 | express-validator | 🔒 高 |
| 错误处理 | 模糊提示 | 🟡 中 |
| 日志记录 | 标准输出 | 🟡 中 |

---

## 相关文件

- [config/database.js](config/database.js) - 数据库连接配置
- [routes/auth.js](routes/auth.js) - 认证路由
- [middleware/auth.js](middleware/auth.js) - 认证中间件
- [schema.sql](schema.sql) - 数据库结构
- [.env.example](.env.example) - 环境变量示例

---

## 联系和支持

如有安全相关的问题或建议，请提交Issue或联系项目维护者。

**重要：** 如发现安全漏洞，请不要公开发布，而是通过私下方式报告给项目维护者。
