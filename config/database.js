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
  charset: 'utf8mb4'
});

// 使用Promise
const promisePool = pool.promise();

module.exports = {
  pool,
  promisePool,
  getConnection: (callback) => {
    pool.getConnection(callback);
  },
  query: (sql, params) => {
    return promisePool.query(sql, params);
  }
};

