const { query } = require('../config/database');

async function migrate() {
  try {
    console.log('开始创建 likes 与 notifications 表...');

    await query(`
      CREATE TABLE IF NOT EXISTS likes (
        like_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        letter_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, letter_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        actor_user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSON DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('迁移完成：likes 与 notifications 表已创建（如不存在）');
  } catch (err) {
    console.error('迁移失败：', err);
  } finally {
    process.exit(0);
  }
}

migrate();
