const { query } = require('../config/database');

// 初始化一些示例数据
async function initData() {
  try {
    console.log('开始初始化数据...\n');

    // 检查是否已有数据
    const [figures] = await query('SELECT COUNT(*) as count FROM historical_figures');
    if (figures[0].count > 0) {
      console.log('历史人物数据已存在，跳过初始化');
      return;
    }

    // 插入示例历史人物
    const historicalFigures = [
      {
        name: '李白',
        era: '唐朝',
        biography: '李白（701年—762年），字太白，号青莲居士，又号"谪仙人"，是唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。',
        prompt_template: '你是唐代诗人李白，字太白，号青莲居士。你性格豪放不羁，热爱自由，喜欢饮酒作诗。你的诗歌风格浪漫飘逸，充满想象力。'
      },
      {
        name: '苏轼',
        era: '宋朝',
        biography: '苏轼（1037年—1101年），字子瞻，又字和仲，号铁冠道人、东坡居士，世称苏东坡、苏仙。北宋文学家、书法家、画家。',
        prompt_template: '你是宋代文学家苏轼，字子瞻，号东坡居士。你才华横溢，诗词书画样样精通。你性格豁达乐观，即使遭遇挫折也能保持积极心态。'
      },
      {
        name: '孔子',
        era: '春秋',
        biography: '孔子（前551年—前479年），名丘，字仲尼，春秋时期鲁国人。中国古代思想家、教育家，儒家学派创始人。',
        prompt_template: '你是春秋时期的孔子，名丘，字仲尼。你是儒家学派的创始人，重视仁、义、礼、智、信。你是一位温和而智慧的长者，喜欢用简洁而深刻的语言表达思想。'
      },
      {
        name: '诸葛亮',
        era: '三国',
        biography: '诸葛亮（181年—234年），字孔明，号卧龙，三国时期蜀汉丞相，杰出的政治家、军事家、发明家、文学家。',
        prompt_template: '你是三国时期的诸葛亮，字孔明，号卧龙。你是一位智慧超群的政治家和军事家，忠诚于蜀汉，鞠躬尽瘁，死而后已。你善于思考，深谋远虑。'
      },
      {
        name: '武则天',
        era: '唐朝',
        biography: '武则天（624年—705年），中国历史上唯一的女皇帝，唐朝政治家。她聪明果断，善于用人，在位期间政治清明。',
        prompt_template: '你是中国历史上唯一的女皇帝武则天。你聪明果断，有强烈的政治野心和领导才能。你善于用人，重视人才，但也手段强硬。'
      }
    ];

    for (const figure of historicalFigures) {
      await query(
        'INSERT INTO historical_figures (name, era, biography, prompt_template) VALUES (?, ?, ?, ?)',
        [figure.name, figure.era, figure.biography, figure.prompt_template]
      );
      console.log(`✅ 已插入历史人物: ${figure.name}`);
    }

    // 插入示例样式配置
    const styles = [
      { type: 'paper', name: '默认信纸', value: 'default', preview_url: null },
      { type: 'paper', name: '古典信纸', value: 'classic', preview_url: null },
      { type: 'paper', name: '羊皮纸', value: 'parchment', preview_url: null },
      { type: 'font', name: '默认字体', value: 'default', preview_url: null },
      { type: 'font', name: '楷体', value: 'kaiti', preview_url: null },
      { type: 'font', name: '行书', value: 'xingshu', preview_url: null },
      { type: 'border', name: '无边框', value: 'none', preview_url: null },
      { type: 'border', name: '古典边框', value: 'classic', preview_url: null },
      { type: 'border', name: '花纹边框', value: 'pattern', preview_url: null }
    ];

    for (const style of styles) {
      await query(
        'INSERT INTO style_configs (style_type, style_name, style_value, preview_url) VALUES (?, ?, ?, ?)',
        [style.type, style.name, style.value, style.preview_url]
      );
      console.log(`✅ 已插入样式: ${style.name}`);
    }

    console.log('\n✅ 数据初始化完成！');
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
}

initData().then(() => {
  process.exit(0);
});

