const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');

/**
 * 添加样式配置脚本
 * 使用方法：
 * node scripts/add-style.js <style_type> <style_name> <style_value> [preview_image_path]
 * 
 * 示例：
 * node scripts/add-style.js paper "古典信纸" classic ./images/classic-paper.jpg
 * node scripts/add-style.js font "楷体字体" kaiti ./images/kaiti-font.jpg
 * node scripts/add-style.js border "古典边框" classic ./images/classic-border.jpg
 */

async function addStyle() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('使用方法：');
      console.log('node scripts/add-style.js <style_type> <style_name> <style_value> [preview_image_path]');
      console.log('');
      console.log('参数说明：');
      console.log('  style_type: 样式类型 (paper/font/border)');
      console.log('  style_name: 样式名称 (如: "古典信纸")');
      console.log('  style_value: 样式值 (如: classic)');
      console.log('  preview_image_path: 预览图片路径 (可选，相对或绝对路径)');
      console.log('');
      console.log('示例：');
      console.log('node scripts/add-style.js paper "古典信纸" classic ./images/classic-paper.jpg');
      console.log('node scripts/add-style.js font "楷体字体" kaiti ./images/kaiti-font.jpg');
      console.log('node scripts/add-style.js border "古典边框" classic ./images/classic-border.jpg');
      process.exit(1);
    }

    const [styleType, styleName, styleValue, imagePath] = args;

    // 验证样式类型
    if (!['paper', 'font', 'border'].includes(styleType)) {
      console.error('❌ 错误：样式类型必须是 paper、font 或 border');
      process.exit(1);
    }

    let previewUrl = null;

    // 如果提供了图片路径，处理图片
    if (imagePath) {
      const imageFullPath = path.isAbsolute(imagePath) 
        ? imagePath 
        : path.join(__dirname, '..', imagePath);

      // 检查文件是否存在
      if (!fs.existsSync(imageFullPath)) {
        console.error(`❌ 错误：图片文件不存在: ${imageFullPath}`);
        process.exit(1);
      }

      // 检查是否是图片文件
      const ext = path.extname(imageFullPath).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowedExts.includes(ext)) {
        console.error(`❌ 错误：不支持的图片格式，支持: ${allowedExts.join(', ')}`);
        process.exit(1);
      }

      // 确保上传目录存在
      const uploadsDir = path.join(__dirname, '../uploads/styles');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`✅ 创建上传目录: ${uploadsDir}`);
      }

      // 生成新文件名
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const newFileName = `style-${uniqueSuffix}${ext}`;
      const destPath = path.join(uploadsDir, newFileName);

      // 复制文件到上传目录
      fs.copyFileSync(imageFullPath, destPath);
      console.log(`✅ 图片已复制到: ${destPath}`);

      // 设置预览URL
      previewUrl = `/uploads/styles/${newFileName}`;
    }

    // 检查样式值是否已存在
    const [existing] = await query(
      'SELECT style_id FROM style_configs WHERE style_type = ? AND style_value = ?',
      [styleType, styleValue]
    );

    if (existing && existing.length > 0) {
      console.log(`⚠️  警告：样式值 "${styleValue}" 已存在，将更新现有记录`);
      
      // 更新现有记录
      await query(
        'UPDATE style_configs SET style_name = ?, preview_url = ? WHERE style_type = ? AND style_value = ?',
        [styleName, previewUrl, styleType, styleValue]
      );
      console.log(`✅ 已更新样式: ${styleName} (${styleType}/${styleValue})`);
    } else {
      // 插入新记录
      await query(
        'INSERT INTO style_configs (style_type, style_name, style_value, preview_url, is_active) VALUES (?, ?, ?, ?, 1)',
        [styleType, styleName, styleValue, previewUrl]
      );
      console.log(`✅ 已添加样式: ${styleName} (${styleType}/${styleValue})`);
    }

    if (previewUrl) {
      console.log(`📸 预览图片URL: ${previewUrl}`);
    }

    console.log('\n✅ 样式添加完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加样式失败:', error);
    process.exit(1);
  }
}

addStyle();

