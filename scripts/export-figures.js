/**
 * 导出历史人物数据为JSON文件
 * 使用方法：node scripts/export-figures.js
 * 导出文件：figures-export.json
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { query } = require('../config/database')

async function exportFigures() {
  try {
    console.log('开始导出人物数据...\n')
    
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
    console.log(`📊 导出数量：${figures.length} 个`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 导出失败:', error)
    process.exit(1)
  }
}

exportFigures()

