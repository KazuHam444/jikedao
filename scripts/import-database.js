const { promisePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  try {
    const jsonFile = process.argv[2] || path.join(__dirname, '..', 'database-export.json');
    
    if (!fs.existsSync(jsonFile)) {
      console.error(`文件不存在：${jsonFile}`);
      process.exit(1);
    }

    console.log('开始导入数据库...\n');
    
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const tables = Object.keys(data);
    
    for (const table of tables) {
      const records = data[table];
      
      if (!records || records.length === 0) {
        console.log(`⏭️  跳过表 ${table} (无数据)`);
        continue;
      }

      // 先清空表
      await promisePool.query(`DELETE FROM ${table}`);

      // 再导入数据
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(',');
      const insertQuery = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
      
      for (const record of records) {
        const values = columns.map(col => record[col]);
        await promisePool.query(insertQuery, values);
      }
      
      console.log(`✅ 已导入表 ${table} (${records.length} 条记录)`);
    }

    console.log('\n✅ 数据导入完成！');
    process.exit(0);

  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

importDatabase();
