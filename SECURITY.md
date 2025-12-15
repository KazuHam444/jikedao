# 安全指南 — SQL 注入防护

本项目默认采用以下策略防止 SQL 注入：

- 使用参数化查询（占位符 `?` + 参数数组）执行所有带用户输入的 SQL。请勿把用户输入直接拼接到 SQL 字符串。数据库库（`config/database.js`）会校验 SQL 中 `?` 占位符的数量是否与参数数组长度匹配，缺失会抛出错误。
- 在连接池配置中设置 `multipleStatements: false`，避免通过分号注入多条语句。
- 对于必须动态拼接的标识符（表名/列名），使用 `escapeId()`（来自 `config/database.js`）进行转义；对于值的应急转义可以使用 `escape()`，但优先使用参数化查询。
- 对于静态存储的敏感字段（例如 `users.email`），可启用对称加密，使用 `DATA_ENCRYPTION_KEY`（写入 `.env`）进行 AES-256-GCM 加密。库提供 `utils/encryption.js` 的 `encrypt()` / `decrypt()` 用法。
- 对传入参数进行严格验证（例如使用 `express-validator`）并采用白名单策略（如排序/分页字段只允许指定值）。

建议：
- 新增 SQL 时优先使用 `query(sql, params)`，避免字符串插值。代码审查时注意未参数化的字符串插值。
- 若需要更强保障，可以采用 ORM（如 `knex` 或 `sequelize`）或启用更严格的静态/运行时检测。

