const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// 创建连接池   
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'cross_time_post',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // 禁用多语句执行以降低 SQL 注入风险（防止通过分号注入额外语句）
  multipleStatements: false
});

// 使用Promise
const promisePool = pool.promise();

module.exports = {
  pool,
  promisePool,
  getConnection: (callback) => {
    pool.getConnection(callback);
  },
  // 基础 query 包装：做一些基本安全校验（占位符与参数数量匹配）并使用参数化查询
  query: async (sql, params) => {
    // 强制参数化查询：如果 SQL 包含 '?' 占位符，则必须提供 params 并且数量匹配
    const placeholderCount = (sql.match(/\?/g) || []).length;
    if (placeholderCount > 0) {
      if (!params || !Array.isArray(params)) {
        throw new Error('安全错误：SQL 包含占位符但未提供参数数组');
      }
      if (params.length < placeholderCount) {
        throw new Error('安全错误：提供的参数数量少于 SQL 中的占位符数');
      }
    }

    return promisePool.query(sql, params);
  },
  // 转义标识符（表名/列名）
  escapeId: (identifier) => mysql.escapeId(identifier),
  // 转义值（仅在不得已时使用，推荐使用参数化查询）
  escape: (value) => mysql.escape(value)
};

