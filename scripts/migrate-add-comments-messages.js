const { query } = require('../config/database');

async function migrate() {
  try {
    console.log('开始创建 comments 与 messages 表...');

    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        letter_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        to_user_id INT NOT NULL,
        from_user_id INT NOT NULL,
        subject VARCHAR(255),
        body TEXT,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('迁移完成：comments 与 messages 表已创建（如不存在）');
  } catch (err) {
    console.error('迁移失败：', err);
  } finally {
    process.exit(0);
  }
}

migrate();
