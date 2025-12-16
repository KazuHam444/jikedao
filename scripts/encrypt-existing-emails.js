const { query } = require('../config/database');
const { encrypt, isEncrypted } = require('../utils/encryption');

async function migrate() {
  console.log('开始批量加密现有 users.email（会跳过已加密行））');
  const [rows] = await query('SELECT user_id, email FROM users');
  let updated = 0;
  for (const r of rows) {
    if (!r.email) continue;
    if (isEncrypted(r.email)) continue;
    const encrypted = encrypt(r.email);
    await query('UPDATE users SET email = ? WHERE user_id = ?', [encrypted, r.user_id]);
    updated++;
    console.log(`已加密 user_id=${r.user_id}`);
  }
  console.log(`完成，加密了 ${updated} 条记录`);
  process.exit(0);
}

migrate().catch(e => {
  console.error('迁移失败:', e);
  process.exit(1);
});