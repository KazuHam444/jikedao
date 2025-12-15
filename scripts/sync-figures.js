/**
 * 同步人物数据脚本
 * 自动导出人物数据并提示提交到Git
 * 使用方法：node scripts/sync-figures.js
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { query } = require('../config/database')

async function syncFigures() {
  try {
    console.log('🔄 开始同步人物数据...\n')
    
    // 获取所有人物数据
    const [figures] = await query(`
      SELECT 
        name,
        era,
        biography,
        avatar_url,
        prompt_template,
        is_active
      FROM historical_figures
      ORDER BY era, name
    `)
    
    // 导出为JSON
    const exportData = {
      export_date: new Date().toISOString(),
      total: figures.length,
      figures: figures
    }
    
    const exportPath = path.join(__dirname, '..', 'figures-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf-8')
    
    console.log(`✅ 导出成功！`)
    console.log(`📁 文件位置：${exportPath}`)
    console.log(`📊 导出数量：${figures.length} 个\n`)
    
    console.log('📝 下一步操作：')
    console.log('1. 检查 figures-export.json 文件内容')
    console.log('2. 提交到Git：')
    console.log('   git add figures-export.json')
    console.log('   git commit -m "更新人物数据"')
    console.log('   git push')
    console.log('\n3. 协作者拉取代码后运行：')
    console.log('   npm run import-figures')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 同步失败:', error)
    process.exit(1)
  }
}

syncFigures()

