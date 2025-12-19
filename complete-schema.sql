-- 创建数据库
CREATE DATABASE IF NOT EXISTS cross_time_post DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cross_time_post;

-- 用户表
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 历史人物表
CREATE TABLE historical_figures (
    figure_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    era VARCHAR(50) NOT NULL,
    biography TEXT,
    avatar_url VARCHAR(255),
    prompt_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 信件表
CREATE TABLE letters (
    letter_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    figure_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    paper_style VARCHAR(50) DEFAULT 'default',
    font_style VARCHAR(50) DEFAULT 'default',
    border_style VARCHAR(50) DEFAULT 'default',
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    writing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'sent', 'replied') DEFAULT 'sent',
    
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (figure_id) REFERENCES historical_figures(figure_id),
    INDEX idx_public_featured (is_public, is_featured),
    INDEX idx_user_date (user_id, writing_date)
);

-- 回信表
CREATE TABLE replies (
    reply_id INT AUTO_INCREMENT PRIMARY KEY,
    letter_id INT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    ai_model VARCHAR(50),
    reply_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentiment_analysis VARCHAR(20),
    
    FOREIGN KEY (letter_id) REFERENCES letters(letter_id) ON DELETE CASCADE
);

-- 管理员表
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('super_admin', 'content_admin') DEFAULT 'content_admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- 样式配置表
CREATE TABLE style_configs (
    style_id INT AUTO_INCREMENT PRIMARY KEY,
    style_type ENUM('paper', 'font', 'border') NOT NULL,
    style_name VARCHAR(50) NOT NULL,
    style_value VARCHAR(255) NOT NULL,
    preview_url VARCHAR(255),
    font_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    letter_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 点赞表
CREATE TABLE likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    letter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, letter_id)
);

-- 通知表
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    actor_user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSON DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    to_user_id INT NOT NULL,
    from_user_id INT NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例历史人物
INSERT INTO historical_figures (name, era, biography) VALUES
('李白', '唐朝', '唐代著名诗人，诗仙...'),
('达芬奇', '文艺复兴', '意大利文艺复兴时期艺术家...'),
('爱因斯坦', '20世纪', '理论物理学家，相对论提出者...');

-- 插入信纸样式
INSERT INTO style_configs (style_type, style_name, style_value, preview_url, font_url) VALUES
('paper', '古典羊皮纸', 'parchment-paper', '/styles/previews/parchment.jpg', NULL),
('paper', '现代简约', 'modern-paper', '/styles/previews/modern.jpg', NULL),
('paper', '浪漫花纹', 'romantic-paper', '/styles/previews/romantic.jpg', NULL);

-- 插入字体样式
INSERT INTO style_configs (style_type, style_name, style_value, preview_url, font_url) VALUES
('font', '楷体书法', 'kaiti-font', '/fonts/previews/kaiti.jpg', NULL),
('font', '行书字体', 'xingshu-font', '/fonts/previews/xingshu.jpg', NULL),
('font', '现代宋体', 'songti-font', '/fonts/previews/songti.jpg', NULL);

-- 插入边框样式
INSERT INTO style_configs (style_type, style_name, style_value, preview_url, font_url) VALUES
('border', '古典花边', 'classic-border', '/borders/previews/classic.jpg', NULL),
('border', '简约线条', 'simple-border', '/borders/previews/simple.jpg', NULL),
('border', '邮票风格', 'stamp-border', '/borders/previews/stamp.jpg', NULL);
