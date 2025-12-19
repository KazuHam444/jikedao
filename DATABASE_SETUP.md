# 数据库初始化与同步指南

本文件说明如何使用项目内脚本在本地创建数据库表并导入示例数据，便于协作者快速同步开发环境。

## 前提
- 已安装 MySQL（或兼容的服务），并能使用账号创建数据库。
- 在项目根目录执行命令（含 `package.json` 的目录）。
- 已安装 Node.js 与 npm，并运行 `npm install` 安装依赖。

## 快速启动方案（推荐 ⚡）

**方案A：一键导入完整数据库**（最快）

如果是新项目或想重新初始化，直接导入 `complete-schema.sql`：

```powershell
# Windows PowerShell（需要指定字符编码以支持中文）
mysql -u root -p --default-character-set=utf8mb4 < complete-schema.sql

# 或在 MySQL 命令行中
source complete-schema.sql;
```

此脚本包含：
- ✅ 所有 8 个数据库表（包括 comments、likes、notifications、messages）
- ✅ 预定义的示例数据
- ✅ 完整的字段配置（含 `font_url` 等新字段）

---

## 完整步骤（推荐用于生产环境 ⚙️）

1. 在 MySQL 中创建数据库（可选，脚本会尝试使用 `DB_NAME`）：

   在 MySQL 中执行：

   ```sql
   CREATE DATABASE IF NOT EXISTS `cross_time_post` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. 配置环境变量：

   - 复制 `.env.example` 为 `.env`，并填写你的数据库连接信息及 `JWT_SECRET` 等：

   ```powershell
   copy .env.example .env
   # 然后使用编辑器打开并填写实际值
   ```

3. 运行后端迁移脚本（项目内已有脚本，会创建缺失的表）：

   ```powershell
   # 在项目根执行
   npm run migrate:likes
   npm run migrate:comments
   ```

   这些脚本会创建 `likes`, `notifications`, `comments`, `messages` 等表（若不存在）。

4. 导入示例数据：

   ```powershell
   npm run init-data
   ```

   脚本会向 `historical_figures`、`style_configs` 等表插入示例数据。

5. （可选）创建管理员账户：

   ```powershell
   npm run create-admin
   ```

6. 启动后端服务：

   ```powershell
   npm run dev
   ```

7. 启动前端（另开终端，进入 `frontend` 目录）：

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## 注意事项

### 字符编码问题 🔤

**重要：** 项目使用 UTF-8 编码，导入 SQL 文件时需要正确指定字符编码，否则中文会显示为乱码。

**正确的导入方式：**

```powershell
# 方法 1：命令行导入（推荐）
mysql -u root -p --default-character-set=utf8mb4 < schema.sql

# 方法 2：直接导入到指定数据库
mysql -u root -p cross_time_post --default-character-set=utf8mb4 < schema.sql

# 方法 3：在 MySQL 中逐行执行
mysql -u root -p
mysql> SET NAMES utf8mb4;
mysql> source schema.sql;
```

**如果已经导入为乱码，修复方法：**

```sql
-- 修复数据库编码
ALTER DATABASE cross_time_post CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复各表编码（以下为示例，需对所有表执行）
ALTER TABLE historical_figures CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE letters CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 其他表类似...
```

### 数据库文件说明
- **`complete-schema.sql`** - 完整的初始化脚本，用于新项目快速启动
- **`schema.sql`** - 当前项目的数据库快照，包含实际数据和完整结构

### 常见问题
- `.env` 文件请勿提交到远程仓库；将 `.env.example` 用作文档参考。
- 如果不是在 `localhost` 或有权限限制，请确保 MySQL 用户具有创建表和写入数据的权限。
- 若已有旧数据表结构不兼容，建议在测试环境新建一个空数据库来运行迁移脚本以避免破坏现有数据。

---