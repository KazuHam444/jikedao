const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads/styles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `style-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器：只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件（jpg, png, gif, webp）'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Multer 错误处理包装函数
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制（最大5MB）'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '上传字段名错误，请使用字段名：image'
      });
    }
    return res.status(400).json({
      success: false,
      message: `上传错误：${err.message}`
    });
  }
  if (err) {
    return res.status(500).json({
      success: false,
      message: err.message || '上传失败'
    });
  }
  next();
}

// 上传样式图片（管理员）
router.post('/style-image', authenticateAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的图片'
        });
      }

      // 返回图片URL（相对于uploads目录）
      const imageUrl = `/uploads/styles/${req.file.filename}`;

      res.json({
        success: true,
        message: '图片上传成功',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('上传图片错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '图片上传失败'
      });
    }
  });
});


// 上传字体文件（管理员）
router.post('/font-file', authenticateAdmin, (req, res, next) => {
  // 确保字体目录存在
  const fontsDir = path.join(__dirname, '../uploads/fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const fontStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, fontsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `font-${uniqueSuffix}${ext}`);
    }
  });

  const fontFileFilter = (req, file, cb) => {
    const allowed = /woff2|woff|ttf|otf/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传字体文件（woff, woff2, ttf, otf）'), false);
    }
  };

  const fontUpload = multer({
    storage: fontStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fontFileFilter
  });

  fontUpload.single('font')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: '字体文件大小超过限制（最大10MB）' });
        }
        return res.status(400).json({ success: false, message: `上传错误：${err.message}` });
      }
      return res.status(500).json({ success: false, message: err.message || '字体上传失败' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择要上传的字体文件' });
      }

      const fontUrl = `/uploads/fonts/${req.file.filename}`;
      res.json({ success: true, message: '字体上传成功', data: { url: fontUrl, filename: req.file.filename, size: req.file.size } });
    } catch (error) {
      console.error('上传字体错误:', error);
      res.status(500).json({ success: false, message: error.message || '字体上传失败' });
    }
  });
});

module.exports = router;

