const { query } = require('../config/database');

async function migrate() {
  try {
    console.log('开始为 style_configs 添加 font_url 字段（如果不存在）...');

    // 先检查字段是否存在
    const [columns] = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'style_configs' AND COLUMN_NAME = 'font_url'
    `);

    if (columns && columns.length > 0) {
      console.log('font_url 字段已存在，无需添加');
    } else {
      await query(`
        ALTER TABLE style_configs
        ADD COLUMN font_url VARCHAR(255) DEFAULT NULL
      `);
      console.log('font_url 字段已添加');
    }

    console.log('迁移完成');
  } catch (err) {
    console.error('迁移失败：', err);
  } finally {
    process.exit(0);
  }
}

migrate();
