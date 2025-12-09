# 数据库初始化与同步指南

本文件说明如何使用项目内脚本在本地创建数据库表并导入示例数据，便于协作者快速同步开发环境。

## 前提
- 已安装 MySQL（或兼容的服务），并能使用账号创建数据库。
- 在项目根目录执行命令（含 `package.json` 的目录）。
- 已安装 Node.js 与 npm，并运行 `npm install` 安装依赖。

## 步骤

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
- `.env` 文件请勿提交到远程仓库；将 `.env.example` 用作文档参考。
- 如果不是在 `localhost` 或有权限限制，请确保 MySQL 用户具有创建表和写入数据的权限。
- 若已有旧数据表结构不兼容，建议在测试环境新建一个空数据库来运行迁移脚本以避免破坏现有数据。

---

如果你希望我一并生成一个 SQL 导出（`schema.sql`）来包含所有表结构，我可以尝试从已有迁移脚本提取建表语句并生成一个 `schema.sql` 文件，或在本地连接数据库导出结构，但后者需要访问你的数据库（不可在此环境执行）。如需 `schema.sql`，请确认我应该仅基于仓库中的迁移脚本生成。