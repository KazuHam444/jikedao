/**
 * 从JSON文件导入历史人物数据
 * 使用方法：node scripts/import-figures.js [文件路径]
 * 默认文件：figures-export.json
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { query } = require('../config/database')

async function importFigures(filePath) {
  try {
    // 确定文件路径
    const importPath = filePath || path.join(__dirname, '..', 'figures-export.json')
    
    if (!fs.existsSync(importPath)) {
      console.error(`❌ 文件不存在：${importPath}`)
      console.log('\n提示：请先运行 node scripts/export-figures.js 导出数据')
      process.exit(1)
    }
    
    console.log(`开始从 ${importPath} 导入人物数据...\n`)
    
    // 读取JSON文件
    const fileContent = fs.readFileSync(importPath, 'utf-8')
    const importData = JSON.parse(fileContent)
    
    if (!importData.figures || !Array.isArray(importData.figures)) {
      console.error('❌ 文件格式错误：缺少 figures 数组')
      process.exit(1)
    }
    
    let addedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    
    for (const figure of importData.figures) {
      // 检查是否已存在
      const [existing] = await query(
        'SELECT figure_id FROM historical_figures WHERE name = ? AND era = ?',
        [figure.name, figure.era]
      )
      
      if (existing && existing.length > 0) {
        // 更新现有记录
        await query(
          `UPDATE historical_figures 
           SET biography = ?, avatar_url = ?, prompt_template = ?, is_active = ?
           WHERE name = ? AND era = ?`,
          [
            figure.biography || null,
            figure.avatar_url || null,
            figure.prompt_template || null,
            figure.is_active !== undefined ? figure.is_active : 1,
            figure.name,
            figure.era
          ]
        )
        console.log(`🔄 已更新：${figure.name}（${figure.era}）`)
        updatedCount++
      } else {
        // 插入新记录
        await query(
          `INSERT INTO historical_figures (name, era, biography, avatar_url, prompt_template, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            figure.name,
            figure.era,
            figure.biography || null,
            figure.avatar_url || null,
            figure.prompt_template || null,
            figure.is_active !== undefined ? figure.is_active : 1
          ]
        )
        console.log(`✅ 已添加：${figure.name}（${figure.era}）`)
        addedCount++
      }
    }
    
    console.log(`\n完成！`)
    console.log(`✅ 成功添加：${addedCount} 个`)
    console.log(`🔄 已更新：${updatedCount} 个`)
    console.log(`📊 总计处理：${importData.figures.length} 个`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 导入失败:', error)
    process.exit(1)
  }
}

// 获取命令行参数
const filePath = process.argv[2]
importFigures(filePath)

