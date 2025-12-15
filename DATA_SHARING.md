# 数据库数据分享指南

本文档说明如何将你的数据库数据导出并与协作者共享，以及协作者如何导入这些数据。

---

## 目录
1. [原理说明](#原理说明)
2. [你的操作步骤（导出数据）](#你的操作步骤导出数据)
3. [协作者的操作步骤（导入数据）](#协作者的操作步骤导入数据)
4. [常见问题](#常见问题)

---

## 原理说明

本项目提供了两种数据分享方式：

### 方式 1：导出/导入 JSON 数据（推荐）
- **导出**：`npm run export-db` 将数据库中所有表的数据导出为 JSON 文件（`database-export.json`）
- **导入**：`npm run import-db` 将 JSON 文件中的数据导入到协作者的数据库
- **优点**：跨平台、易于版本控制、不含密码（管理员表被排除）
- **缺点**：大数据量时文件较大

### 方式 2：SQL 备份（备选）
- 使用 MySQL 命令行工具 `mysqldump` 导出完整 SQL
- 协作者通过 MySQL 客户端导入 SQL 文件
- **优点**：保留完整的数据库结构和索引
- **缺点**：依赖本地 MySQL 工具

本指南主要介绍**方式 1**（推荐用于协作）。

---

## 你的操作步骤（导出数据）

### 步骤 1：确保本地数据库运行
数据库必须可访问，并包含你要分享的所有数据。

### 步骤 2：运行导出命令
在项目根目录打开终端，执行：

```powershell
npm run export-db
```

**输出示例：**
```
开始导出数据库...

✅ 已导出表 users (5 条记录)
✅ 已导出表 historical_figures (15 条记录)
✅ 已导出表 letters (23 条记录)
✅ 已导出表 replies (12 条记录)
✅ 已导出表 style_configs (9 条记录)
✅ 已导出表 comments (8 条记录)
✅ 已导出表 messages (3 条记录)
✅ 已导出表 likes (18 条记录)
✅ 已导出表 notifications (25 条记录)

✅ 数据导出完成！文件位置：D:\VS Code\jikedao\database-export.json
```

### 步骤 3：分享导出文件
导出完成后会生成 `database-export.json` 文件，包含所有数据。

- **方式 A（推荐）**：通过 Git 提交
  ```powershell
  git add database-export.json
  git commit -m "refactor: share database data snapshot"
  git push
  ```

- **方式 B（快速分享）**：直接发送文件给协作者（邮件、云盘等）

---

## 协作者的操作步骤（导入数据）

### 步骤 1：克隆/拉取最新代码
如果通过 Git 分享：

```powershell
git clone <repo-url>
cd jikedao
git pull origin main
```

如果通过文件分享，将 `database-export.json` 放在项目根目录。

### 步骤 2：安装依赖并配置环境
```powershell
npm install
copy .env.example .env
# 编辑 .env，填写本地 MySQL 凭据
```

### 步骤 3：创建空数据库并初始化表结构
```powershell
# 创建数据库并初始化所有表
npm run migrate:likes
npm run migrate:comments
```

### 步骤 4：导入数据
```powershell
npm run import-db
```

**输出示例：**
```
开始导入数据库...

✅ 已导入表 users (5 条记录)
✅ 已导入表 historical_figures (15 条记录)
✅ 已导入表 letters (23 条记录)
✅ 已导入表 replies (12 条记录)
✅ 已导入表 style_configs (9 条记录)
✅ 已导入表 comments (8 条记录)
✅ 已导入表 messages (3 条记录)
✅ 已导入表 likes (18 条记录)
✅ 已导入表 notifications (25 条记录)

✅ 数据导入完成！
```

### 步骤 5：启动应用
```powershell
# 后端
npm run dev

# 前端（另开终端）
cd frontend
npm install
npm run dev
```

---

## 常见问题

### Q1：导出时提示"数据库连接失败"
**A：** 检查以下项：
- MySQL 服务是否运行？
- `.env` 文件中的 `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD` 是否正确？
- 防火墙是否阻止 MySQL 连接？

### Q2：导入时提示"表已存在"或"数据重复"
**A：** 这是正常的，因为 `npm run migrate:*` 会创建表。如果要清空重导：
```powershell
# 方式 1：手动删除表
# 登录 MySQL 执行：DROP TABLE table_name;

# 方式 2：删除整个数据库重建（谨慎使用）
# 在 MySQL 中：DROP DATABASE cross_time_post; CREATE DATABASE cross_time_post CHARACTER SET utf8mb4;
```

### Q3：导出的 JSON 文件很大，如何减小？
**A：** 编辑 `scripts/export-database.js`，从 `tablesToExport` 数组中移除不需要的表（如 `notifications`）。

### Q4：管理员账户密码是否被导出？
**A：** **不会**。出于安全考虑，`admins` 表被排除在导出外。协作者需要运行：
```powershell
npm run create-admin
```
来创建自己的管理员账户。

### Q5：导入后的用户密码是否正确？
**A：** **是的**。用户密码以 bcrypt 哈希值存储，导出和导入过程中密码哈希不变，登录时密码校验逻辑相同，所以用户可以用原密码登录。

### Q6：如何选择性导入某些表？
**A：** 编辑 `scripts/import-database.js`，修改导入逻辑或手动编辑 `database-export.json` 移除不需要的表数据。

### Q7：可以导出到指定文件名吗？
**A：** 导出文件默认为 `database-export.json`。如需自定义，编辑 `scripts/export-database.js` 第 XX 行的 `outputFile` 变量。导入时指定文件：
```powershell
npm run import-db -- /path/to/custom-export.json
```

---

## SQL 备份方案（备选）

如果协作者更倾向使用 SQL 文件，可以使用 MySQL 工具导出：

### 导出 SQL（你的操作）
```powershell
mysqldump -h localhost -u root -p cross_time_post > backup.sql
# 输入密码后导出
```

### 导入 SQL（协作者的操作）
```powershell
# 创建空数据库
mysql -u root -p -e "CREATE DATABASE cross_time_post CHARACTER SET utf8mb4;"

# 导入 SQL
mysql -u root -p cross_time_post < backup.sql
```

---

## 总结速查表

| 场景 | 你的命令 | 协作者的命令 |
|------|---------|-----------|
| 导出全部数据 | `npm run export-db` | - |
| 导入全部数据 | - | `npm run import-db` |
| 创建表结构 | - | `npm run migrate:likes && npm run migrate:comments` |
| 创建管理员 | - | `npm run create-admin` |
| 初始化示例数据 | - | `npm run init-data` |

---

## 最佳实践

1. **定期导出快照**：每周或有重要更新时运行 `npm run export-db` 并提交
2. **版本控制**：把 `database-export.json` 加入 Git 但用 `.gitignore` 过滤敏感字段（如密码）
3. **备份管理员信息**：保管好 `.env` 中的 `JWT_SECRET`，不要分享给协作者
4. **测试导入**：在新环境测试导入流程，确保数据完整性
5. **团队约定**：约定什么时候导出/导入，避免数据冲突

---

### Q8：在写信时有时看到“发送成功”和“发送失败”同时出现，为什么？
**A：** 这通常是因为重复提交导致（例如双击发送/在预览里重复点击确认）。已在前端加入防止重复提交的保护（按钮禁用与 loading 状态），后端也增加了幂等保护：短时间内（30 秒内）对相同用户提交相同标题与内容会被拒绝，返回 HTTP 409。遇到该情况请等待或刷新重试。

---

有任何问题欢迎反馈！
