# 数据库数据分享 - 快速参考

## 🚀 一句话总结
- **你**：运行 `npm run export-db` 导出数据到 `database-export.json`，提交或分享给协作者
- **协作者**：运行 `npm run import-db` 从 `database-export.json` 导入数据

---

## 📋 完整操作流程

### 你的操作（导出数据）

```powershell
# 1. 确保在项目根目录
cd d:\VS Code\jikedao

# 2. 导出当前数据库
npm run export-db

# 3. 通过 Git 分享
git add database-export.json
git commit -m "refactor: export current database snapshot"
git push
```

**导出结果示例：**
```
✅ 已导出表 users (5 条记录)
✅ 已导出表 historical_figures (101 条记录)
✅ 已导出表 letters (38 条记录)
✅ 已导出表 replies (15 条记录)
✅ 已导出表 style_configs (10 条记录)
✅ 已导出表 comments (8 条记录)
✅ 已导出表 messages (2 条记录)
✅ 已导出表 likes (9 条记录)
✅ 已导出表 notifications (14 条记录)
✅ 数据导出完成！
```

---

### 协作者的操作（导入数据）

```powershell
# 1. 克隆或拉取最新代码
git clone <repo-url>
cd jikedao
git pull origin main

# 2. 安装依赖
npm install

# 3. 配置环境（复制 .env.example 并填写 MySQL 凭据）
copy .env.example .env
# 编辑 .env，修改 DB_HOST/DB_PORT/DB_USER/DB_PASSWORD

# 4. 创建并初始化数据库表结构
npm run migrate:likes
npm run migrate:comments

# 5. 导入你分享的数据
npm run import-db

# 6. 启动应用
npm run dev

# 在另一个终端启动前端
cd frontend
npm install
npm run dev
```

**导入结果示例：**
```
✅ 已导入表 users (5 条记录)
✅ 已导入表 historical_figures (101 条记录)
✅ 已导入表 letters (38 条记录)
✅ 已导入表 replies (15 条记录)
✅ 已导入表 style_configs (10 条记录)
✅ 已导入表 comments (8 条记录)
✅ 已导入表 messages (2 条记录)
✅ 已导入表 likes (9 条记录)
✅ 已导入表 notifications (14 条记录)
✅ 数据导入完成！
```

---

## 📁 关键文件说明

| 文件 | 说明 |
|------|------|
| `database-export.json` | 导出的数据文件（包含 9 个表的所有数据，约 50-500KB） |
| `scripts/export-database.js` | 导出脚本 |
| `scripts/import-database.js` | 导入脚本 |
| `schema.sql` | 完整的数据库表结构定义 |
| `.env.example` | 环境变量示例（协作者需要复制并填写） |
| `DATA_SHARING.md` | 详细的数据分享文档 |

---

## ⚡ 命令速查

```powershell
# 导出数据
npm run export-db

# 导入数据
npm run import-db

# 创建数据库表
npm run migrate:likes
npm run migrate:comments

# 导入示例数据（如果不需要真实数据）
npm run init-data

# 创建管理员账户
npm run create-admin
```

---

## ⚠️ 重要提示

1. **不包含管理员账户**：出于安全考虑，`admins` 表不被导出。协作者需要运行 `npm run create-admin` 创建自己的管理员账户。

2. **密码是安全的**：用户密码以 bcrypt 哈希值存储，导出导入过程中不会改变，用户仍可用原密码登录。

3. **数据库必须存在**：导入前协作者需要：
   - 本地 MySQL 运行
   - `.env` 配置正确
   - 数据库已创建（`npm run migrate:*` 会自动创建表）

4. **定期导出**：建议每周或有重要更新时运行一次导出，保持数据同步。

---

## 🔍 调试提示

**导出失败？**
```powershell
# 检查 MySQL 连接
mysql -h localhost -u root -p cross_time_post -e "SELECT COUNT(*) FROM users;"

# 检查 .env 配置
cat .env | grep DB_
```

**导入失败？**
```powershell
# 检查表是否存在
mysql -u root -p cross_time_post -e "SHOW TABLES;"

# 手动清空并重新导入
mysql -u root -p cross_time_post -e "DELETE FROM notifications; DELETE FROM likes; ..."
npm run import-db
```

---

详细文档请查看 [DATA_SHARING.md](./DATA_SHARING.md)
