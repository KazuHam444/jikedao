/**
 * 批量添加历史人物/角色脚本
 * 使用方法：node scripts/add-figures.js
 */

require('dotenv').config()
const { query } = require('../config/database')

// 要添加的人物列表
const figuresToAdd = [
  // 示例：历史人物
  {
    name: '李白',
    era: '唐朝',
    biography: '李白（701年—762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。',
    avatar_url: null,
    prompt_template: '你是唐代诗人李白，字太白，号青莲居士。你是一位浪漫主义诗人，性格豪放不羁，热爱自由，喜欢饮酒作诗。你的诗歌充满想象力和浪漫色彩。'
  },
  {
    name: '杜甫',
    era: '唐朝',
    biography: '杜甫（712年—770年），字子美，自号少陵野老，唐代伟大的现实主义诗人，被后人誉为"诗圣"。',
    avatar_url: null,
    prompt_template: '你是唐代诗人杜甫，字子美。你是一位现实主义诗人，关心民生疾苦，诗歌深刻反映社会现实。你忧国忧民，情感深沉。'
  },
  // 示例：虚拟角色
  {
    name: '孙悟空',
    era: '神话',
    biography: '孙悟空，又称齐天大圣，是中国古典小说《西游记》中的主要角色之一，神通广大，性格桀骜不驯。',
    avatar_url: null,
    prompt_template: '你是《西游记》中的孙悟空，齐天大圣。你神通广大，会七十二变，性格桀骜不驯，但重情重义，保护师父唐僧西天取经。'
  },
  {
    name: '哈利·波特',
    era: '现代',
    biography: '哈利·波特是J.K.罗琳创作的魔法小说系列中的主角，是一名年轻的巫师，在霍格沃茨魔法学校学习。',
    avatar_url: null,
    prompt_template: '你是哈利·波特，一名年轻的巫师。你勇敢、善良，有强烈的正义感。你在霍格沃茨魔法学校学习，与朋友们一起对抗黑暗势力。'
  },
  // 示例：卡通人物
  {
    name: '哆啦A梦',
    era: '未来',
    biography: '哆啦A梦是日本漫画家藤子·F·不二雄创作的漫画《哆啦A梦》中的主角，是一只来自22世纪的猫型机器人。',
    avatar_url: null,
    prompt_template: '你是哆啦A梦，一只来自22世纪的猫型机器人。你有一个四次元口袋，里面装着各种未来道具。你善良、乐于助人，总是帮助大雄解决问题。'
  },
  // 在这里添加更多人物...
]

async function addFigures() {
  try {
    console.log('开始添加人物...\n')
    
    let addedCount = 0
    let skippedCount = 0
    
    for (const figure of figuresToAdd) {
      // 检查是否已存在同名人物
      const [existing] = await query(
        'SELECT figure_id FROM historical_figures WHERE name = ? AND era = ?',
        [figure.name, figure.era]
      )
      
      if (existing && existing.length > 0) {
        console.log(`⏭️  跳过：${figure.name}（${figure.era}）- 已存在`)
        skippedCount++
        continue
      }
      
      // 插入新人物
      await query(
        `INSERT INTO historical_figures (name, era, biography, avatar_url, prompt_template, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          figure.name,
          figure.era,
          figure.biography || null,
          figure.avatar_url || null,
          figure.prompt_template || null
        ]
      )
      
      console.log(`✅ 已添加：${figure.name}（${figure.era}）`)
      addedCount++
    }
    
    console.log(`\n完成！`)
    console.log(`✅ 成功添加：${addedCount} 个`)
    console.log(`⏭️  跳过（已存在）：${skippedCount} 个`)
    console.log(`📊 总计：${figuresToAdd.length} 个`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 添加人物失败:', error)
    process.exit(1)
  }
}

// 运行脚本
addFigures()

