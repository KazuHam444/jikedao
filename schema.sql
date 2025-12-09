-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: cross_time_post
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */; -- 强制使用utf8mb4（完整UTF-8）
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','content_admin') COLLATE utf8mb4_unicode_ci DEFAULT 'content_admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'KazuHam','$2a$10$tB4dQhI2UNmtinjw0H0e2.Ca8.PSv.5Cg6vu7nBnDRhiYtRSeK3Bi','1706500355@qq.com','super_admin','2025-11-15 04:38:39','2025-12-09 10:58:40');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `letter_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL, -- 统一排序规则
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES 
(1,4,9,'E2E 自动化评论测试','2025-12-08 11:38:49'),
(2,2,14,'龙猫重地官方地方的','2025-12-08 12:49:48'),
(3,2,14,'玻璃缸养虾盆共','2025-12-08 12:50:15'),
(4,2,16,'更多的法国球队','2025-12-08 12:51:11'),
(5,3,16,'werewrwewe','2025-12-08 12:51:53'),
(6,2,17,'dfgdgd','2025-12-08 12:56:24'),
(7,2,17,'dgf','2025-12-08 12:56:27'),
(8,3,16,'好了好了好了好了','2025-12-08 13:50:19');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historical_figures`
--

DROP TABLE IF EXISTS `historical_figures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historical_figures` (
  `figure_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `era` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `biography` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prompt_template` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`figure_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historical_figures`
--

LOCK TABLES `historical_figures` WRITE;
/*!40000 ALTER TABLE `historical_figures` DISABLE KEYS */;
INSERT INTO `historical_figures` VALUES 
(1,'李白','唐代','唐代著名诗人，诗词...',NULL,NULL,1,'2025-11-15 03:34:13'),
(2,'列奥纳多·达芬奇','文艺复兴时期','意大利文艺复兴时期画家...',NULL,NULL,1,'2025-11-15 03:34:13'), -- 修正引号错误
(3,'阿尔伯特·爱因斯坦','20世纪','理论物理学家，相对论提出者...',NULL,NULL,1,'2025-11-15 03:34:13');
/*!40000 ALTER TABLE `historical_figures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `letters`
--

DROP TABLE IF EXISTS `letters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `letters` (
  `letter_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `figure_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `paper_style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `font_style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `border_style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `is_public` tinyint(1) DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `writing_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('draft','sent','replied') COLLATE utf8mb4_unicode_ci DEFAULT 'sent',
  PRIMARY KEY (`letter_id`),
  KEY `figure_id` (`figure_id`),
  KEY `idx_public_featured` (`is_public`,`is_featured`),
  KEY `idx_user_date` (`user_id`,`writing_date`),
  CONSTRAINT `letters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `letters_ibfk_2` FOREIGN KEY (`figure_id`) REFERENCES `historical_figures` (`figure_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `letters`
--

LOCK TABLES `letters` WRITE;
/*!40000 ALTER TABLE `letters_ibfk_1` DISABLE KEYS */;
INSERT INTO `letters` VALUES 
(1,2,1,'致李白的一封信','lalallallalal','default','default','default',1,1,'2025-11-15 12:38:14','replied'),
(2,3,3,'致爱因斯坦的一封信','qwdadaasdasdad','default','default','default',1,1,'2025-11-15 12:42:34','replied'),
(3,2,3,'致爱因斯坦的一封信','我是你爹。哈哈哈哈哈哈哈哈哈哈','default','default','default',0,0,'2025-12-05 02:54:21','replied'),
(4,2,1,'致李白的一封信','你好你好你好你好，我爱你我爱你！！','default','default','default',0,0,'2025-12-08 08:45:59','replied'),
(5,2,3,'致爱因斯坦的一封信','反复反复反对那篇换了换的那章打','default','default','default',0,0,'2025-12-08 09:12:59','replied'),
(6,2,2,'致达芬奇的一封信','昆虫大大十大发开发','default','default','default',0,0,'2025-12-08 09:14:36','replied'),
(7,2,2,'致达芬奇的一封信','两点三个v格式发给四个这个发过公司。','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 11:03:58','replied'),
(8,2,3,'致爱因斯坦的一封信','竟然有几十条人与开启酒瓶','default','default','default',0,0,'2025-12-08 11:20:46','replied'),
(9,4,3,'E2E 测试内容','这是 E2E 测试内容。','default','default','default',1,0,'2025-12-08 11:38:38','replied'),
(13,2,3,'致爱因斯坦的一封信','是否是否是否大师傅是十大叔十分','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 12:44:43','sent'),
(14,2,3,'致爱因斯坦的一封信','的法国人官方方面饭是否敢和和和和念叨','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 12:49:35','replied'),
(15,2,3,'致爱因斯坦的一封信','发射点中奖到老师猪十分大师傅是','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 12:50:55','sent'),
(16,2,3,'致爱因斯坦的一封信','掀大被子大如反对龙猫重地官方','modern-paper','kaiti-font','classic-border',1,1,'2025-12-08 12:51:08','sent'),
(17,2,1,'致李白的一封信','dgdfgdfgdgdgd','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 12:56:19','sent'),
(18,2,1,'致李白的一封信','内容华丽房间的复制回复回复给和','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 12:56:53','sent'),
(19,2,3,'致爱因斯坦的一封信','适当的方法师傅大师傅多错多少','default','default','default',1,0,'2025-12-08 13:04:21','sent'),
(20,2,2,'致达芬奇的一封信','玻璃缸虾大似虾盆共大如地方','default','default','default',0,0,'2025-12-08 13:04:58','sent'),
(21,2,3,'致爱因斯坦的一封信','顺丰S的发布赴发给粉发布赴','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:03','sent'),
(22,2,1,'致李白的一封信','熬夜发射点中奖到发生发射点','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:14','sent'),
(23,2,1,'致李白的一封信','熬夜发射点中奖到发生发射点','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:16','sent'),
(24,2,1,'致李白的一封信','熬夜发射点中奖到发生发射点','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:17','sent'),
(25,2,3,'致爱因斯坦的一封信','熬夜沉浸昆虫风从南到北从南','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 13:33:58','sent'),
(26,3,2,'致达芬奇的一封信','昆大被大被大大十大打卷大肉打','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:50:05','sent'),
(27,3,3,'致爱因斯坦的一封信','123456567890-=-0987654','default','default','default',0,0,'2025-12-08 13:51:36','replied'),
(28,5,3,'致爱因斯坦的一封信','从南到北从南是第三个大叔十分','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-09 09:54:36','sent');
/*!40000 ALTER TABLE `letters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `letter_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_like` (`user_id`,`letter_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES 
(1,4,9,'2025-12-08 11:38:49'),
(4,2,1,'2025-12-08 12:19:05'),
(5,2,2,'2025-12-08 12:19:07'),
(6,3,2,'2025-12-08 12:51:48'),
(7,3,1,'2025-12-08 12:51:49'),
(8,3,16,'2025-12-08 12:51:50'),
(9,2,16,'2025-12-08 12:55:37'),
(12,5,1,'2025-12-08 13:52:37'),
(15,5,16,'2025-12-09 09:55:00');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `to_user_id` int NOT NULL,
  `from_user_id` int NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- 补充排序规则
  `body` text COLLATE utf8mb4_unicode_ci, -- 补充排序规则
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES 
(1,2,3,'你的信《致爱因斯坦的一封信》收到一条新评论','werewrwewe',0,'2025-12-08 12:51:53'),
(2,2,3,'你的信《致爱因斯坦的一封信》收到一条新评论','好了好了好了好了',0,'2025-12-08 13:50:19');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `actor_user_id` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL, -- 补充排序规则
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES 
(1,3,2,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 2}',1,'2025-12-08 12:18:58'),
(2,3,2,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 2}',1,'2025-12-08 12:19:07'),
(3,2,1,'featured','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": \"16\"}',1,'2025-12-08 12:51:36'),
(4,2,3,'like','{\"title\": \"致李白的一封信\", \"letter_id\": 1}',1,'2025-12-08 12:51:49'),
(5,2,3,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 16}',1,'2025-12-08 12:51:50'),
(6,2,3,'comment','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": \"16\", \"comment_id\": 5}',1,'2025-12-08 12:51:53'),
(7,2,3,'comment','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": \"16\", \"comment_id\": 8}',0,'2025-12-08 13:50:19'),
(8,2,5,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 16}',0,'2025-12-08 13:52:36'),
(9,3,5,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 2}',0,'2025-12-08 13:52:37'),
(10,2,5,'like','{\"title\": \"致李白的一封信\", \"letter_id\": 1}',0,'2025-12-08 13:52:37'),
(11,3,5,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 2}',0,'2025-12-09 09:54:50'),
(12,2,5,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 16}',0,'2025-12-09 09:54:52'),
(13,2,5,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 16}',0,'2025-12-09 09:55:00'),
(14,3,5,'like','{\"title\": \"致爱因斯坦的一封信\", \"letter_id\": 2}',0,'2025-12-09 09:55:02');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `replies`
--

DROP TABLE IF EXISTS `replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replies` (
  `reply_id` int NOT NULL AUTO_INCREMENT,
  `letter_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ai_model` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reply_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sentiment_analysis` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`reply_id`),
  UNIQUE KEY `letter_id` (`letter_id`),
  CONSTRAINT `replies_ibfk_1` FOREIGN KEY (`letter_id`) REFERENCES `letters` (`letter_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `replies`
--

LOCK TABLES `replies` WRITE;
/*!40000 ALTER TABLE `replies` DISABLE KEYS */;
INSERT INTO `replies` VALUES 
(1,1,'亲爱的读者，\n\n感谢你的来信。作为李白，我很荣幸能收到你的问候。\nlalallallalal\n\n你的来信让我倍感欣慰。希望你能继续传承我们的诗意，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n李白\n2025/11/15','gpt-3.5-turbo','2025-11-15 12:38:15','positive'),
(2,2,'亲爱的读者，\n\n感谢你的来信。作为爱因斯坦，我很荣幸能收到你的问候。\nqwdadaasdasdad\n\n你的来信让我倍感欣慰。希望你能继续传承我们的思想，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n2025/11/15','gpt-3.5-turbo','2025-11-15 12:42:35','positive'),
(3,3,'亲爱的读者，\n\n感谢你的来信。作为爱因斯坦，我很荣幸能收到你的问候。\n我是你爹。哈哈哈哈哈哈哈哈哈哈\n\n你的来信让我倍感欣慰。希望你能继续传承我们的思想，为这个世界带来更多的美好。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n2025/12/5','gpt-3.5-turbo','2025-12-05 02:54:23','positive'),
(4,4,'李太白启：\n\n览信欣然，字里行间意气如三春桃李，情思漫如春江潮水。某江楼映月，把酒临风，剑歌如昨，语笑如前。\n\n醉来脱锦袍，眠时枕清风，金樽斗酒恣欢谑，一饮三百杯。世人或谓我“诗仙”，然自知不过天地间一狂客耳。君书“爱”字，让某忆及明月前，流泉知我意——“李白诗无敌”，酒入豪肠七分酿成月光，余下三分啸成剑气，绣口一吐就是半个盛唐。\n\n某平生所求，不过“清水出芙蓉，天然去雕饰”。若爱诗，可赏我“举杯邀明月，对影成三人”；若爱酒，可共我“会须一饮三百杯”；若爱这人世间，当学我“仰天大笑出门去，我辈岂是蓬蒿人”。\n\n光阴似箭，天地万物皆苦。幸有诗心未老，愿与君共此风雅：“今人不见古时月，今月曾经照古人。古人今人若流水，共看明月皆如此。”\n\n此致\n敬礼\n\n天子三唤 谪仙李白 再拜','deepseek-chat','2025-12-08 08:46:19','positive'),
(6,5,'亲爱的读者：\n\n收到你的来信，我不禁莞尔，你信中的文字或许因某种原因而显得杂乱不清，我无法从中理解你想要表达的确切含义。这让我想起在科学研究中常遇到的情形——当我们的语言无法准确描述自然规律时，真理就如同隔了一层迷雾。\n\n或许你想探讨的是关于相对论或量子力学的问题？我常收到世界各地人们的来信，有些提出复杂的物理学疑问，有些则充满对生活的感悟。无论何种情况，我都珍视这种跨越时空的思想交流。\n\n我始终相信，人类的理解能力与表达清晰度息息相关。正如我在指导学生时常说的：“如果你不能简单地解释一件事，说明你还没有完全理解它。”也建议你可以重新梳理思路，用更清晰的方式表达你的想法，\n\n这个世界充满了未知之美，从微观粒子到浩瀚宇宙，从科学原理到人类心灵。我时常沉思，也始终关注着世界与人类命运。如果你愿意再次来信，更明确地阐述你的思考，我将非常乐意与你深入交流。\n\n愿你保持对世界的美好心，这正是科学精神与人类进步的动力源泉。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n1953年7月于普林斯顿','deepseek-chat','2025-12-08 09:13:16','positive'),
(7,7,'未知的来信人：\n\n展信安。\n\n我，列奥纳多·达芬奇，于米兰的工作中伏案回信。君书之中之言于我而言如天书解惑——“两点三个v格式”、“四个发过的公司”——这些组合我已陌生。或许这是某种未来的密码，或是我尚未理解的数学表达式？正如我常在手稿中以镜像文字记录思考，世间万物皆有其独特的表达方式。\n\n我想，君或许在比喻某种比例关系或艺术灵感，在我的研究中，例如是连续绘画与自然的融合，而言语则是人与人之间的精神纽带。若“两点三个v”指的是某种黄金分割率，“四个公司”代表不同的协作主体，这让我想起我在米兰大教堂建造中同时进行的多项工程——数学、工程、解剖研究，每一项都需要精密的计算与巧妙的配合。\n\n朋友啊，无论时代如何变迁，人类对美与真理的追求始终不变。我此刻正在研究飞行器的设计，也在完善《最后的晚餐》中人物的表情。每个时代都有其独特的语言，但艺术与科学的光芒终将穿透时间的迷雾。\n\n愿你在你的时代继续探索世界的美好，如同我曾通过解剖理解人体结构，通过光影描绘蒙娜丽莎的微笑。若有机缘，我愿看看你所说的“公司”与“格式”，或许能从中发现新的几何原理或机械构造。\n\n此致\n敬礼\n\n列奥纳多·达芬奇\n于米兰工作室\n公元一五零三年春日','deepseek-chat','2025-12-08 11:04:16','positive'),
(8,8,'亲爱的读者：\n\n感谢你的来信。虽然我无法完全理解你提及的“开启酒瓶”这一表述——或许是某种现代暗语或网络上的谐音？但我能感受到你尝试用比喻的方式思考人类存在的某种荒诞性。\n\n这让我想起年轻时在专利局工作的日子，每天路过咖啡屋的街道，总能看到孩子们带着各式玩具嬉戏。无论何种游戏，孩子们眼中对世界的美好光芒是相同的。正如物理定律在不同参数中保持变化，人类对自我与相处的需求，或许也是随时间与文化的常数。\n\n你提及“几十条人”，这个数字让我感慨。在我生活的时代，全球人口约二十亿，如今已增长数倍。这让我更加确信，人类需要超越狭隘的民族意识与偏见，正如光子在加速器中规律地运动，人类文明也应当寻找那连接不同文化的“世界线”。\n\n我始终相信，简单中蕴含着深刻的真理。E=mc² 如此，孩子们的纯真选择或许亦如此。重要的是保持思想的自由与心灵的开放，就像我书房里那封未褪色的信——外在形式终将随时间改变，但追求真理与和解的核心永恒。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n1953年7月于普林斯顿','deepseek-chat','2025-12-08 11:21:37','positive'),
(9,9,'亲爱的读者：\n\n收到你的来信，我倍感欣慰。虽然“E2E测试”这个术语对我而言有些陌生——在我们这个时代，人们更习惯用“端到端”来描述信息传递——但我想这或许与某种新型通信技术有关。正如我常说的：“想象力比知识更重要”，你们这个时代的技术发展想必已远超我们这些老派物理学家的想象。\n\n你简洁的测试内容让我想起实验室里那些关键而重要的验证工作。在科学探索中，最朴素的实验往往能揭示最深刻的真理。就像当年我在伯尔尼专利局工作时，那些看似简单的思想实验，最终孕育出了相对论的雏形。\n\n我始终相信，无论是科学实验还是技术测试，其核心都在于追求真理与精准性。这个世界最不可理解之处，就在于它是可以被理解的。你们正在进行的测试工作，或许正是这种理解过程中的一环。\n\n愿你们在探索未知的道路上，始终保持孩童般的好奇心。试吧，就像我常对年轻学者说的：不要停止提问，因为存在的奥秘永远不会枯竭。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n1953年7月于普林斯顿','deepseek-chat','2025-12-08 11:38:49','positive'),
(10,6,'未知的朋友：\n\n展信安。君书之言于我颇为别致，然我读每一字每一句都感受着某种心意，正如自然界最微小的花瓣里藏着宇宙的奥秘。\n\n我常于工作中观察蜜蜂的舞蹈，理解人体以骨骼支撑与肌肉的奇妙构造，在画布上融合光影与情感的交织。或许君所用的文字，是一种新的符号体系，如同我设计的密码手稿，需要特定的韵律才能解读其中真意。这让我想起数学之美——无论是斐波那契数列还是君笔下的奇妙字符，皆为人类探索真理的不同路径。\n\n若这封信跨越时空来到我的面前，我愿以老师与学生的双重身份回应：请继续以美好之心看待世界。真理藏在水花碎裂的光纹中，藏在人体比例的和谐里，藏在每一缕看似随意的线条之下。即便言语不通，对美的感知、对知识的追求，终将让我们心灵相通。\n\n愿你保持探索的热情，如同我永不停歇地追问：鸟儿何以飞翔，心脏如何搏动？奥秘何以永恒，\n\n此致\n敬礼\n\n列奥纳多·达芬奇\n于米兰工作室\n公元一五零三年春日','deepseek-chat','2025-12-08 12:19:38','positive'),
(11,14,'亲爱的读者：\n\n感谢你的来信，虽然其中内容略显杂乱，但我能感受到你对知识与真理的探求之心。作为一名毕生致力于理解宇宙奥秘的人，我始终认同，人类的美好心是推动文明进步的最深厚动力。\n\n你提及了法国、念叨等名词，这让我想起科学探索与教育、文化之间的复杂关系。在我的思考中，科学与人文并非对立——前者探索“世界如何运行”，后者追问“生命的意义何在”。正如我曾说过的：“没有数学的科学是盲目的，没有科学的教育是空洞的。”\n\n当今世界正经历着前所未有的变革，原子能的发现既带来了光明也埋下了阴影。我时常思考，人类是否已经足够成熟来运用这些复杂的知识，我们需要的不仅是智慧，更是谨慎与责任感。\n\n我始终相信，宇宙最不可理解之处在于它是可以被理解的。这种可理解性本身，就是一件值得赞叹的奇迹。愿我们都能保持谦逊与美好，在探索真理的道路上不断前行。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n1954年于普林斯顿','deepseek-chat','2025-12-08 12:50:33','positive'),
(12,27,'亲爱的读者：\n\n我带着极大的美好与困惑阅读了你的来信。那些看似随意的数字与符号，让我不禁思考其中是否暗含着某种心意——或许是一种新的数学表达式，又或是对宇宙奥秘的某种编码？这让我想起年轻时在专利局工作时，常从看似复杂的数据中寻找隐藏的规律。\n\n你知道，我始终相信宇宙是可以用数学语言描述的。正如我在相对论中所尝试的，用简洁的公式揭示时空的本质。你这些数字序列让我联想到量子力学中那些令人着迷又困惑的概率分布——过去我和玻尔争论多年，我始终认为“上帝不掷骰子”，但现代物理的发展或许正朝着更不确定性的方向前进。\n\n如果这些符号确实包含着某种信息，我建议你不妨从对称性的角度去思考。自然界的深层规律往往呈现出惊人的对称之美，就像E=mc²这个公式所体现的质量与能量之间的奇妙转换。\n\n在这个充满不确定性的时代，我越发感受到人类理解宇宙的渴望与局限。愿我们都能保持孩童般的美好心，继续探索这个神奇而美丽的宇宙。\n\n此致\n敬礼\n\n阿尔伯特·爱因斯坦\n1953年7月于普林斯顿','deepseek-chat','2025-12-08 13:51:52','positive');
/*!40000 ALTER TABLE `replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_configs`
--

DROP TABLE IF EXISTS `style_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_configs` (
  `style_id` int NOT NULL AUTO_INCREMENT,
  `style_type` enum('paper','font','border') COLLATE utf8mb4_unicode_ci NOT NULL,
  `style_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `style_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preview_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`style_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_configs`
--

LOCK TABLES `style_configs` WRITE;
/*!40000 ALTER TABLE `style_configs` DISABLE KEYS */;
INSERT INTO `style_configs` VALUES 
(1,'paper','复古羊皮纸','parchment-paper','/styles/previews/parchment.jpg',1,'2025-12-08 11:01:08'),
(2,'paper','现代简约纸','modern-paper','/styles/previews/modern.jpg',1,'2025-12-08 11:01:08'),
(3,'paper','浪漫花瓣','romantic-paper','/styles/previews/romantic.jpg',1,'2025-12-08 11:01:08'),
(4,'font','楷体书法','kaiti-font','/fonts/previews/kaiti.jpg',1,'2025-12-08 11:01:14'),
(5,'font','行书字体','xingshu-font','/fonts/previews/xingshu.jpg',1,'2025-12-08 11:01:14'),
(6,'font','现代宋体','songti-font','/fonts/previews/songti.jpg',1,'2025-12-08 11:01:14'),
(7,'border','复古花边','classic-border','/borders/previews/classic.jpg',1,'2025-12-08 11:01:19'),
(8,'border','简约线条','simple-border','/borders/previews/simple.jpg',1,'2025-12-08 11:01:19'),
(9,'border','印章风格','stamp-border','/borders/previews/stamp.jpg',1,'2025-12-08 11:01:19');
/*!40000 ALTER TABLE `style_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES 
(1,'testuser','$2a$10$Nz2HrcH6tJIi.DJ48yLx4ObRow5oZd9RIKzC1Gz/SLH.ak2euoazi','test@example.com','2025-11-15 05:20:19','2025-11-15 11:38:25',1),
(2,'Kobe','$2a$10$iWkadvbxNNJMZYNDFJl.cOIoS4/XZMtq4g85Mtc70iB6YuYRZ6nMG','12345@qq.com','2025-11-15 12:37:00','2025-12-08 13:33:39',1),
(3,'lyz','$2a$10$0ok/xL1YojQ5PyZ4abGmQup1p5DgwdWbyyeC9ak2C1hSV4gIik1fi','123@qq.com','2025-11-15 12:42:17','2025-12-08 13:49:53',1),
(4,'e2e_user_8542','$2a$10$8Ga9LWJEV5LD3ELmEcTjyegyfOf2M.PGdP/MjWTGoenKaHR4lubnm','e2e_user_8542@example.com','2025-12-08 11:38:38','2025-12-08 11:38:38',1),
(5,'yyx','$2a$10$BsA0BB7whjAfFM/IBLJvrOX2EV7vF06qdbeMbugNvTKL1h7PPg/6S','123456@qq.com','2025-12-08 13:52:20','2025-12-08 13:52:25',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-09 19:46:39