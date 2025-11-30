const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('=== 创建管理员账户 ===\n');

    const username = await question('请输入管理员用户名: ');
    if (!username.trim()) {
      console.log('用户名不能为空');
      rl.close();
      return;
    }

    const password = await question('请输入密码: ');
    if (!password.trim()) {
      console.log('密码不能为空');
      rl.close();
      return;
    }

    const email = await question('请输入邮箱: ');
    if (!email.trim()) {
      console.log('邮箱不能为空');
      rl.close();
      return;
    }

    const role = await question('请输入角色 (super_admin/content_admin，默认content_admin): ') || 'content_admin';
    if (!['super_admin', 'content_admin'].includes(role)) {
      console.log('角色必须是 super_admin 或 content_admin');
      rl.close();
      return;
    }

    // 检查用户名是否已存在
    const [existingAdmins] = await query(
      'SELECT admin_id FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('用户名或邮箱已存在');
      rl.close();
      return;
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 插入管理员
    const [result] = await query(
      'INSERT INTO admins (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, email, role]
    );

    console.log('\n✅ 管理员账户创建成功！');
    console.log(`管理员ID: ${result.insertId}`);
    console.log(`用户名: ${username}`);
    console.log(`邮箱: ${email}`);
    console.log(`角色: ${role}`);

    rl.close();
  } catch (error) {
    console.error('创建管理员失败:', error);
    rl.close();
  }
}

createAdmin();

