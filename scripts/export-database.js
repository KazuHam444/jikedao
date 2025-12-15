const { promisePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  try {
    console.log('开始导出数据库...\n');

    // 要导出的表（不导出 admins，因为包含密码）
    const tablesToExport = [
      'users',
      'historical_figures',
      'letters',
      'replies',
      'style_configs',
      'comments',
      'messages',
      'likes',
      'notifications'
    ];

    // 导出数据为 JSON 格式
    const exportData = {};

    for (const table of tablesToExport) {
      const query = `SELECT * FROM ${table}`;
      const [results] = await promisePool.query(query);
      exportData[table] = results;
      console.log(`✅ 已导出表 ${table} (${results.length} 条记录)`);
    }

    const outputFile = path.join(__dirname, '..', 'database-export.json');
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`\n✅ 数据导出完成！文件位置：${outputFile}`);
    process.exit(0);

  } catch (error) {
    console.error('导出失败:', error);
    process.exit(1);
  }
}

exportDatabase();
