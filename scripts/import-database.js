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
      // 临时关闭外键检查以避免删除父表时因子表存在引用而失败
      await promisePool.query('SET FOREIGN_KEY_CHECKS=0');
      let fkChecksDisabled = true;
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    // 用于检测 ISO 8601 UTC 日期字符串（例如 2025-11-15T05:20:19.000Z）
    const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
    function toMySqlDatetime(isoString) {
      const d = new Date(isoString);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    }
    const tables = Object.keys(data);
    
    try {
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
        const values = columns.map(col => {
          let val = record[col];
          // 如果是 ISO 日期字符串，转换为 MySQL DATETIME 字符串
          if (typeof val === 'string' && isoUtcRegex.test(val)) {
            return toMySqlDatetime(val);
          }
          // 如果是对象或数组，序列化为 JSON 文本
          if (val && typeof val === 'object') {
            return JSON.stringify(val);
          }
          return val;
        });
        await promisePool.query(insertQuery, values);
      }
      
      console.log(`✅ 已导入表 ${table} (${records.length} 条记录)`);
      }

      console.log('\n✅ 数据导入完成！');
      process.exit(0);
    } finally {
      // 确保恢复外键检查，无论导入成功或失败
      if (fkChecksDisabled) {
        try {
          await promisePool.query('SET FOREIGN_KEY_CHECKS=1');
        } catch (e) {
          console.error('警告：恢复外键检查时出错', e);
        }
      }
    }

  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

importDatabase();
