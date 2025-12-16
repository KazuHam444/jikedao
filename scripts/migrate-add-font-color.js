const { promisePool } = require('../config/database')

async function migrate() {
  try {
    console.log('添加 font_color 字段到 letters 表...')
    
    // 检查字段是否已存在
    const connection = await promisePool.getConnection()
    
    try {
      const [rows] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_NAME = 'letters' AND COLUMN_NAME = 'font_color' AND TABLE_SCHEMA = ?`,
        ['cross_time_post']
      )
      
      if (rows.length > 0) {
        console.log('✓ font_color 字段已存在')
      } else {
        // 添加字段
        await connection.query(
          `ALTER TABLE letters ADD COLUMN font_color VARCHAR(7) DEFAULT '#333333' AFTER border_style`
        )
        console.log('✓ 成功添加 font_color 字段')
      }
    } finally {
      connection.release()
    }
    
    console.log('迁移完成！')
    process.exit(0)
  } catch (error) {
    console.error('迁移失败:', error)
    process.exit(1)
  }
}

migrate()
