-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: cross_time_post
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,4,9,'E2E 鑷姩璇勮娴嬭瘯','2025-12-08 11:38:49'),(2,2,14,'姊佃拏鍐堝湴鏂瑰畼鍦版柟瀹樼殑','2025-12-08 12:49:48'),(3,2,14,'璞嗚厫骞茶眴鑵愬共','2025-12-08 12:50:15'),(4,2,16,'鏇村鐨勬硶鍥介槦','2025-12-08 12:51:11'),(5,3,16,'werewrwewe','2025-12-08 12:51:53'),(6,2,17,'dfgdgd','2025-12-08 12:56:24'),(7,2,17,'dgf','2025-12-08 12:56:27'),(8,3,16,'浜嗕簡浜嗕簡浜嗕簡浜嗕簡','2025-12-08 13:50:19');
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
INSERT INTO `historical_figures` VALUES (1,'鏉庣櫧','鍞愭湞','鍞愪唬钁楀悕璇椾汉锛岃瘲浠?..',NULL,NULL,1,'2025-11-15 03:34:13'),(2,'杈捐姮濂?,'鏂囪壓澶嶅叴','鎰忓ぇ鍒╂枃鑹哄鍏存椂鏈熻壓鏈...',NULL,NULL,1,'2025-11-15 03:34:13'),(3,'鐖卞洜鏂潶','20涓栫邯','鐞嗚鐗╃悊瀛﹀锛岀浉瀵硅鎻愬嚭鑰?..',NULL,NULL,1,'2025-11-15 03:34:13');
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
/*!40000 ALTER TABLE `letters` DISABLE KEYS */;
INSERT INTO `letters` VALUES (1,2,1,'鑷存潕鐧界殑涓€灏佷俊','lalallallalal','default','default','default',1,1,'2025-11-15 12:38:14','replied'),(2,3,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','qwdadaasdasdad','default','default','default',1,1,'2025-11-15 12:42:34','replied'),(3,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鎴戞槸浣犵埞銆傚搱鍝堝搱鍝堝搱鍝堝搱鍝堝搱鍝堝搱鍝堝搱','default','default','default',0,0,'2025-12-05 02:54:21','replied'),(4,2,1,'鑷存潕鐧界殑涓€灏佷俊','浣犲ソ浣犲ソ浣犲ソ浣犲ソ锛屾垜鐖变綘鎴戠埍浣犳垜鐖变綘锛侊紒锛?,'default','default','default',0,0,'2025-12-08 08:45:59','replied'),(5,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鍙嶅鎾掑弽瀵归偅閲岀炕浜嗙炕鐨勯偅绡囨墦娉?,'default','default','default',0,0,'2025-12-08 09:12:59','replied'),(6,2,2,'鑷磋揪鑺鐨勪竴灏佷俊','闃胯惃澶уぇ鍗佸ぇ鍙戝彂鍙戝彂','default','default','default',0,0,'2025-12-08 09:14:36','replied'),(7,2,2,'鑷磋揪鑺鐨勪竴灏佷俊','浜岀偣涓変釜v鏂瑰紡鍙戠粰鍥涗釜杩欎釜鍙戣繃瑾撶殑鍏徃銆?,'parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 11:03:58','replied'),(8,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鏄剧劧鏈夊崄鍑犱嚎浜轰笌寮€瑁嗚￥閰?,'default','default','default',0,0,'2025-12-08 11:20:46','replied'),(9,4,3,'E2E 娴嬭瘯淇?,'杩欐槸 E2E 娴嬭瘯鍐呭銆?,'default','default','default',1,0,'2025-12-08 11:38:38','replied'),(13,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鏄惁鏄惁鏄ぇ甯堝倕澹ぇ澶＋澶уか鍗佸垎','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 12:44:43','sent'),(14,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鐨勬硶鍥戒汉瀹樻柟楗惁鍢€鍜曞榾鍜曟⒌钂傚唸','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 12:49:35','replied'),(15,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鍙戝皠鐐圭姱寰椾笂澶у笀鍌呭崄鍒嗗ぇ甯堝倕鏄?,'parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 12:50:55','sent'),(16,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鎼炲ぇ閿呴キ澶ф鍙嶅姊佃拏鍐堝湴鏂瑰畼','modern-paper','kaiti-font','classic-border',1,1,'2025-12-08 12:51:08','sent'),(17,2,1,'鑷存潕鐧界殑涓€灏佷俊','dgdfgdfgdgdgd','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 12:56:19','sent'),(18,2,1,'鑷存潕鐧界殑涓€灏佷俊','闃靛璞崕濂楁埧鐨勬仮澶嶅洖澶嶇粰鍜?,'parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 12:56:53','sent'),(19,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','閫傚綋鐨勬帾鏂絭澹ぇ澶儨澶氳礋灏?,'default','default','default',1,0,'2025-12-08 13:04:21','sent'),(20,2,2,'鑷磋揪鑺鐨勪竴灏佷俊','璞嗚厫骞插ぇ姒傝眴鑵愬共澶ф鍦版柟','default','default','default',0,0,'2025-12-08 13:04:58','sent'),(21,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鍙慥S鐨勫彂椤轰赴鍒颁粯椤轰赴','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:03','sent'),(22,2,1,'鑷存潕鐧界殑涓€灏佷俊','鎾掓棪鍙戝皠鐐圭姱寰椾笂鍙戠敓鍙戝皠鐐?,'parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:14','sent'),(23,2,1,'鑷存潕鐧界殑涓€灏佷俊','鎾掓棪鍙戝皠鐐圭姱寰椾笂鍙戠敓鍙戝皠鐐?,'parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:16','sent'),(24,2,1,'鑷存潕鐧界殑涓€灏佷俊','鎾掓棪鍙戝皠鐐圭姱寰椾笂鍙戠敓鍙戝皠鐐?,'parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:25:17','sent'),(25,2,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鎾掕寖寰疯惃鍙戦『涓板埌浠橀『涓?,'parchment-paper','kaiti-font','classic-border',0,0,'2025-12-08 13:33:58','sent'),(26,3,2,'鑷磋揪鑺鐨勪竴灏佷俊','闃垮ぇ鎾掑ぇ鎾掑ぇ澶у崄澶ф墦绠楀ぇ鑻忔墦','parchment-paper','kaiti-font','classic-border',1,0,'2025-12-08 13:50:05','sent'),(27,3,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','123456567890-=-0987654','default','default','default',0,0,'2025-12-08 13:51:36','replied'),(28,5,3,'鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊','鍙戦『涓板埌浠橀『涓版槸绗笁鏂瑰＋澶уか','parchment-paper','kaiti-font','classic-border',0,0,'2025-12-09 09:54:36','sent');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,4,9,'2025-12-08 11:38:49'),(4,2,1,'2025-12-08 12:19:05'),(5,2,2,'2025-12-08 12:19:07'),(6,3,2,'2025-12-08 12:51:48'),(7,3,1,'2025-12-08 12:51:49'),(8,3,16,'2025-12-08 12:51:50'),(9,2,16,'2025-12-08 12:55:37'),(12,5,1,'2025-12-08 13:52:37'),(15,5,16,'2025-12-09 09:55:00');
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
  `subject` varchar(255) DEFAULT NULL,
  `body` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,2,3,'浣犵殑淇°€婅嚧鐖卞洜鏂潶鐨勪竴灏佷俊銆嬫敹鍒颁竴鏉℃柊璇勮','werewrwewe',0,'2025-12-08 12:51:53'),(2,2,3,'浣犵殑淇°€婅嚧鐖卞洜鏂潶鐨勪竴灏佷俊銆嬫敹鍒颁竴鏉℃柊璇勮','浜嗕簡浜嗕簡浜嗕簡浜嗕簡',0,'2025-12-08 13:50:19');
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
  `type` varchar(50) NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,2,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 2}',1,'2025-12-08 12:18:58'),(2,3,2,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 2}',1,'2025-12-08 12:19:07'),(3,2,1,'featured','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": \"16\"}',1,'2025-12-08 12:51:36'),(4,2,3,'like','{\"title\": \"鑷存潕鐧界殑涓€灏佷俊\", \"letter_id\": 1}',1,'2025-12-08 12:51:49'),(5,2,3,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 16}',1,'2025-12-08 12:51:50'),(6,2,3,'comment','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": \"16\", \"comment_id\": 5}',1,'2025-12-08 12:51:53'),(7,2,3,'comment','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": \"16\", \"comment_id\": 8}',0,'2025-12-08 13:50:19'),(8,2,5,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 16}',0,'2025-12-08 13:52:36'),(9,3,5,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 2}',0,'2025-12-08 13:52:37'),(10,2,5,'like','{\"title\": \"鑷存潕鐧界殑涓€灏佷俊\", \"letter_id\": 1}',0,'2025-12-08 13:52:37'),(11,3,5,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 2}',0,'2025-12-09 09:54:50'),(12,2,5,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 16}',0,'2025-12-09 09:54:52'),(13,2,5,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 16}',0,'2025-12-09 09:55:00'),(14,3,5,'like','{\"title\": \"鑷寸埍鍥犳柉鍧︾殑涓€灏佷俊\", \"letter_id\": 2}',0,'2025-12-09 09:55:02');
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
INSERT INTO `replies` VALUES (1,1,'浜茬埍鐨勬湅鍙嬶紝\n\n鎰熻阿浣犵殑鏉ヤ俊銆備綔涓烘潕鐧斤紝鎴戝緢楂樺叴鑳芥敹鍒颁綘鐨勯棶鍊欍€俓n\nlalallallalal\n\n浣犵殑鏉ヤ俊璁╂垜娣辨劅娆ｆ叞銆傚笇鏈涗綘鑳界户缁紶鎵挎垜浠殑绮剧锛屼负杩欎釜涓栫晫甯︽潵鏇村鐨勭編濂姐€俓n\n姝よ嚧\n鏁ぜ\n\n鏉庣櫧\n2025/11/15','gpt-3.5-turbo','2025-11-15 12:38:15','positive'),(2,2,'浜茬埍鐨勬湅鍙嬶紝\n\n鎰熻阿浣犵殑鏉ヤ俊銆備綔涓虹埍鍥犳柉鍧︼紝鎴戝緢楂樺叴鑳芥敹鍒颁綘鐨勯棶鍊欍€俓n\nqwdadaasdasdad\n\n浣犵殑鏉ヤ俊璁╂垜娣辨劅娆ｆ叞銆傚笇鏈涗綘鑳界户缁紶鎵挎垜浠殑绮剧锛屼负杩欎釜涓栫晫甯︽潵鏇村鐨勭編濂姐€俓n\n姝よ嚧\n鏁ぜ\n\n鐖卞洜鏂潶\n2025/11/15','gpt-3.5-turbo','2025-11-15 12:42:35','positive'),(3,3,'浜茬埍鐨勬湅鍙嬶紝\n\n鎰熻阿浣犵殑鏉ヤ俊銆備綔涓虹埍鍥犳柉鍧︼紝鎴戝緢楂樺叴鑳芥敹鍒颁綘鐨勯棶鍊欍€俓n\n鎴戞槸浣犵埞銆傚搱鍝堝搱鍝堝搱鍝堝搱鍝堝搱鍝堝搱鍝堝搱\n\n浣犵殑鏉ヤ俊璁╂垜娣辨劅娆ｆ叞銆傚笇鏈涗綘鑳界户缁紶鎵挎垜浠殑绮剧锛屼负杩欎釜涓栫晫甯︽潵鏇村鐨勭編濂姐€俓n\n姝よ嚧\n鏁ぜ\n\n鐖卞洜鏂潶\n2025/12/5','gpt-3.5-turbo','2025-12-05 02:54:23','positive'),(4,4,'鏌愮櫧椤块锛歕n\n寰楀悰涔︽湱锛屽睍鍗疯€岃锛屽瓧鍙ョ偨鐑堝涓夋槬妗冩潕锛屾儏鎰忓娑屼技涔濇洸榛勬渤銆傛煇鏈睙婀栨暎浜猴紝璇楅厭鐙傜敓锛屽拷钂欏姝ゅ帤鐖憋紝璇氭兌璇氭亹銆俓n\n蹇嗘様浠楀墤鍑鸿渶锛屾诞鑸熸礊搴紝閱夊崸闀垮畨閰掕倖锛岄啋鍚熷簮灞遍鐎戙€備笘浜烘垨璋撴垜鈥滆蔼浠欌€濓紝鐒舵煇鑷煡涓嶈繃澶╁湴闂翠竴鐥翠汉鑰炽€傚悰瑷€鈥滅埍鈥濆瓧锛屼护鏌愭€濆強鏄庢湀鍓嶈韩锛屾祦姘寸煡闊斥€斺€旀様骞存潨瀛愮編璧犺瘲浜戔€滅櫧涔熻瘲鏃犳晫鈥濓紝璐虹洃鍛兼垜鈥滆蔼浠欎汉鈥濓紝姝ょ殕浠ヨ瘲榄傜浉濂戯紝闈炲叧淇楁儏銆備粖鍚涢殧鍗冭浇浜戠儫鑰屽瘎蹇冨０锛屽彲鏄埍閭ｉ潚宕栭棿鐨勭櫧楣匡紵鎴栨槸鐖遍偅閲戞ń涓殑鏄庢湀锛熸姂鎴栫埍閭ｂ€滈粍娌充箣姘村ぉ涓婃潵鈥濈殑娴╄崱姘旈瓌锛焅n\n鏌愬钩鐢熸墍姹傦紝涓嶈繃鈥滄竻姘村嚭鑺欒搲锛屽ぉ鐒跺幓闆曢グ鈥濄€傝嫢鍚涚埍璇楋紝璇峰悰鍏辫祻宄ㄧ湁灞辨湀鍗婅疆绉嬶紱鑻ュ悰鐖遍厭锛屽彲閬ヤ妇鐞夌拑閽熷楗惀鐝€鍏夛紱鑻ュ悰鐖辫繖浜洪棿锛屽綋瀛︽煇鈥滀话澶╁ぇ绗戝嚭闂ㄥ幓鈥濓紝韪忛亶闈掑北浜烘湭鑰併€俓n\n鍏夐槾鐧句唬杩囧锛屽ぉ鍦颁竾鐗╅€嗘梾銆傚垢鏈夎瘲蹇冧笉鐏紝浣垮崈骞寸姽鍙叡姝ゆ槦娌炽€傜焊鐭儏闀匡紝涓斾互鏂版垚鍙ョ浉璧狅細鈥滀簯绗哄拷闄嶄節闇勬枃锛岀煡鏄汉闂存湁璧ゅ勘銆備粬鏃ヨ嫢閫㈤潚楦熶娇锛屼笌鍚涘悓閱夊ぇ楣忎簯銆傗€漒n\n姝よ嚧\n鏁ぜ\n\n澶╁疂涓夎浇 闄囪タ鏉庣櫧 鍐嶆嫓','deepseek-chat','2025-12-08 08:46:19','positive'),(6,5,'浜茬埍鐨勬湅鍙嬶細\n\n鏀跺埌鎮ㄧ殑鏉ヤ俊锛屾垜涓嶅緱涓嶅潶璇氱浉鍛婏紝鎮ㄤ俊涓殑鏂囧瓧浼间箮鍥犳煇绉嶅師鍥犺€屾樉寰楁贩涔变笉娓咃紝鎴戞棤娉曚粠涓悊瑙ｆ偍鎯宠琛ㄨ揪鐨勭‘鍒囧惈涔夈€傝繖璁╂垜鎯宠捣鍦ㄧ瀛︽帰绱腑甯搁亣鍒扮殑鎯呭舰鈥斺€斿綋鎴戜滑鐨勮瑷€鏃犳硶鍑嗙‘鎻忚堪鑷劧瑙勫緥鏃讹紝鐪熺悊渚垮鍚岄殧鐫€涓€灞傝糠闆俱€俓n\n鎴栬鎮ㄦ兂鎺㈣鐨勬槸鍏充簬鐩稿璁烘垨閲忓瓙鍔涘鐨勯棶棰橈紵鎴戝父甯告敹鍒颁笘鐣屽悇鍦颁汉浠殑鏉ヤ俊锛屾湁浜涙彁鍑烘繁鍒荤殑鐗╃悊瀛︾枒闂紝鏈変簺鍒欏垎浜瀹囧畽鐨勫摬鎬濄€傛棤璁轰綍绉嶆儏鍐碉紝鎴戦兘鐝嶈杩欑璺ㄨ秺鏃剁┖鐨勬€濇兂浜ゆ祦銆俓n\n鎴戝缁堢浉淇★紝浜虹被鐨勭悊瑙ｈ兘鍔涗笌琛ㄨ揪娓呮櫚搴﹀瘑鍒囩浉鍏炽€傛濡傛垜鍦ㄦ櫘鏋楁柉椤挎椂甯稿骞磋交瀛﹁€呰鐨勶細鈥滃鏋滀綘涓嶈兘绠€鍗曞湴瑙ｉ噴涓€浠朵簨锛岃鏄庝綘杩樻病鏈夊畬鍏ㄧ悊瑙ｅ畠銆傗€濅篃璁告偍鍙互閲嶆柊鏁寸悊鎬濈华锛岀敤鏇存竻鏅扮殑鏂瑰紡琛ㄨ揪鎮ㄧ殑鎯虫硶锛焅n\n杩欎釜涓栫晫鍏呮弧浜嗘湭瑙ｄ箣璋滐紝浠庡井瑙傜矑瀛愬埌娴╃€氬畤瀹欙紝浠庣瀛﹀師鐞嗗埌浜虹被蹇冪伒銆傛垜鏅氬勾鏃跺父鎬濊€冪粺涓€鍦鸿锛屼篃娣卞垏鍏虫敞鐫€涓栫晫鍜屽钩涓庝汉绫诲懡杩愩€傚鏋滄偍鎰挎剰鍐嶆鏉ヤ俊锛屾洿鏄庣‘鍦伴槓杩版偍鐨勬€濊€冿紝鎴戝皢闈炲父涔愭剰涓庢偍娣卞叆鎺㈣銆俓n\n鎰挎偍淇濇寔瀵逛笘鐣岀殑濂藉蹇冿紝杩欐鏄瀛︾簿绁炰笌浜虹被杩涙鐨勫姩鍔涙簮娉夈€俓n\n姝よ嚧\n鏁ぜ\n\n闃垮皵浼壒路鐖卞洜鏂潶\n1953骞?鏈堜簬鏅灄鏂】','deepseek-chat','2025-12-08 09:13:16','positive'),(7,7,'鑷存湭鐭ョ殑鏉ヤ俊鑰咃細\n\n灞曚俊瀹夈€俓n\n鎴戯紝鍒楀ゥ绾冲路杈韭疯姮濂囷紝浜庣背鍏扮殑宸ヤ綔瀹や腑鎵х瑪鍥炰俊銆傝櫧闃佷笅淇′腑涔嬭浜庢垜鑰岃█濡傚ぉ涔﹁埇璐硅В鈥斺€斺€滀簩鐐逛笁涓獀鏂瑰紡鈥濄€佲€滃洓涓彂杩囪獡鐨勫叕鍙糕€濃€斺€旇繖浜涘鐗圭殑缁勫悎浠ゆ垜鍥版儜涓嶅凡銆傛垨璁歌繖鏄煇绉嶆湭鏉ョ殑瀵嗙爜锛屾垨鏄垜灏氭湭鐞嗚В鐨勬暟瀛﹁〃杈撅紵姝ｅ鎴戝父鍦ㄦ墜绋夸腑浠ラ暅鍍忔枃瀛楄褰曟€濊€冿紝涓栭棿涓囩墿鐨嗘湁鍏剁嫭鐗圭殑琛ㄨ揪鏂瑰紡銆俓n\n鎴戠寽鎯筹紝闃佷笅鎴栬鍦ㄦ帰璁ㄦ煇绉嶆瘮渚嬪叧绯绘垨濂戠害绮剧锛熷湪鎴戠殑鐮旂┒涓紝姣斾緥鏄繛鎺ヨ壓鏈笌鑷劧鐨勬ˉ姊侊紝鑰岃獡瑷€鍒欐槸浜轰笌浜轰箣闂寸殑绁炲湥绾藉甫銆傝嫢鈥滀簩鐐逛笁涓獀鈥濇寚鐨勬槸鏌愮姣斾緥灏哄害锛屸€滃洓涓叕鍙糕€濅唬琛ㄤ笉鍚岀殑鍗忎綔鍥綋锛岃繖鍊掍护鎴戞兂璧锋垜鍦ㄧ背鍏板ぇ鍏寤蜂腑鍚屾椂杩涜鐨勫椤瑰鎵樷€斺€旂粯鐢汇€佸伐绋嬨€佽В鍓栫爺绌讹紝姣忎竴椤归兘闇€瑕佺簿纭殑璁＄畻涓庡簞涓ョ殑鎵胯銆俓n\n鏈嬪弸鍟婏紝鏃犺鏃朵唬濡備綍鍙樿縼锛屼汉绫诲缇庝笌鐪熺悊鐨勮拷姹傛案鎭掍笉鍙樸€傛垜姝ゅ埢姝ｅ湪鐮旂┒椋炶鍣ㄧ殑璁捐锛屼篃鍦ㄥ畬鍠勩€婃渶鍚庣殑鏅氶銆嬩腑鐘瑰ぇ鐨勮〃鎯呫€傛瘡涓椂浠ｉ兘鏈夊叾鐙壒鐨勮瑷€锛屼絾鑹烘湳涓庣瀛︾殑鍏夎緣缁堝皢绌块€忔椂闂寸殑杩烽浘銆俓n\n鎰块榿涓嬪湪鎮ㄧ殑鏃朵唬缁х画鎺㈢储涓栫晫鐨勫ゥ绉橈紝濡傚悓鎴戦€忚繃瑙ｅ墫鐞嗚В浜轰綋鏋勯€狅紝閫忚繃鍏夊奖鎹曟崏鐏甸瓊鐨勯ⅳ鍔ㄣ€傝嫢鏈夋満浼氾紝鎴戠敋鎯崇湅鐪嬫偍鎵€璇寸殑鈥滃叕鍙糕€濅笌鈥滄柟寮忊€濓紝鎴栬鑳戒粠涓彂鐜版柊鐨勫嚑浣曞師鐞嗘垨鏈烘鏋勯€犮€俓n\n姝よ嚧\n鏁ぜ\n\n鍒楀ゥ绾冲路杈韭疯姮濂嘰n浜庣背鍏癨n1503骞寸鏈?,'deepseek-chat','2025-12-08 11:04:16','positive'),(8,8,'浜茬埍鐨勬湅鍙嬶細\n\n鎰熻阿鎮ㄧ殑鏉ヤ俊銆傝櫧鐒舵垜鏃犳硶瀹屽叏鐞嗚В鎮ㄦ彁鍒扮殑鈥滃紑瑁嗚￥閰封€濊繖涓€琛ㄨ堪鈥斺€旀垨璁告槸鏌愮鐜颁唬淇氳鎴栫炕璇戜笂鐨勫亸宸紵浣嗘垜鑳芥劅鍙楀埌鎮ㄨ瘯鍥剧敤杞绘澗鐨勬柟寮忔帰璁ㄤ汉绫诲瓨鍦ㄧ殑鏌愮鏅亶鎬с€俓n\n杩欒鎴戞兂璧峰勾杞绘椂鍦ㄤ笓鍒╁眬宸ヤ綔鐨勬棩瀛愶紝姣忓ぉ璺繃鑻忛粠涓栬澶达紝鎬昏兘鐪嬪埌瀛╁瓙浠┛鐫€鍚勫紡绔ヨ瀣夋垙銆傛棤璁烘槸浣曠鏈嶉グ锛屽瀛愪滑鐪间腑瀵逛笘鐣岀殑濂藉鍏夎姃鎬绘槸鐩镐技鐨勩€傛濡傜墿鐞嗗畾寰嬪湪涓嶅悓鍙傝€冪郴涓繚鎸佸崗鍙橈紝浜虹被瀵硅嚜鐢变笌鑸掗€傜殑杩芥眰锛屾垨璁镐篃鏄法瓒婃椂浠ｄ笌鏂囧寲鐨勫父鏁般€俓n\n鎮ㄦ彁鍒扳€滃崄鍑犱嚎浜衡€濓紝杩欎釜鏁板瓧璁╂垜娌夋€濄€傚湪鎴戠敓娲荤殑鏃朵唬锛屽叏鐞冧汉鍙ｇ害浜屽崄浜匡紝濡備粖宸插闀挎暟鍊嶃€傝繖璁╂垜鏇村姞纭俊锛屼汉绫婚渶瑕佽秴瓒婄嫮闅樼殑姘戞棌涓讳箟涓庡亸瑙侊紝姝ｅ鍏夊瓙鍦ㄥ紩鍔涘満涓部娴嬪湴绾胯繍鍔紝浜虹被鏂囨槑涔熷簲褰撳鎵鹃偅鏉¤兘杩炴帴涓嶅悓鏂囧寲鐨勨€滀笘鐣岀嚎鈥濄€俓n\n鎴戝缁堢浉淇★紝绠€鍗曚腑钑村惈鐫€娣卞埢鐨勭湡鐞嗐€侲=mc虏 濡傛锛屽绔ョ殑琛ｇ潃閫夋嫨鎴栬浜﹀姝ゃ€傞噸瑕佺殑鏄繚鎸佹€濇兂鐨勮嚜鐢变笌蹇冪伒鐨勫紑鏀撅紝灏卞儚鎴戜功鎴块噷閭ｅ紶涓嶇┛琚滃瓙鐨勭収鐗団€斺€斿鍦ㄥ舰寮忕粓灏嗛殢鏃堕棿鏀瑰彉锛屼絾杩芥眰鐪熺悊涓庤垝閫傜殑鏈績姘告亽銆俓n\n姝よ嚧\n鏁ぜ\n\n闃垮皵浼壒路鐖卞洜鏂潶\n1953骞?鏈堜簬鏅灄鏂】','deepseek-chat','2025-12-08 11:21:37','positive'),(9,9,'浜茬埍鐨勬湅鍙嬶細\n\n鏀跺埌鎮ㄧ殑鏉ヤ俊锛屾垜棰囨劅濂藉銆傝櫧鐒垛€淓2E娴嬭瘯鈥濊繖涓湳璇鎴戣€岃█鏈変簺闄岀敓鈥斺€斿湪鎴戜滑杩欎釜鏃朵唬锛屼汉浠洿涔犳儻鐢ㄢ€滅鍒扮鈥濇潵鎻忚堪鐢垫姤浼犺緭鈥斺€斾絾鎴戠寽鎯宠繖鎴栬涓庢煇绉嶆柊鍨嬮€氫俊鎶€鏈湁鍏炽€傛濡傛垜甯歌鐨勶細鈥滄兂璞″姏姣旂煡璇嗘洿閲嶈鈥濓紝浣犱滑杩欎釜鏃朵唬鐨勬妧鏈彂灞曟兂蹇呭凡杩滆秴鎴戜滑杩欎簺鑰佹淳鐗╃悊瀛﹀鐨勬兂璞°€俓n\n鎮ㄧ畝娲佺殑娴嬭瘯鍐呭璁╂垜鎯宠捣瀹為獙瀹ら噷閭ｄ簺鍩虹鑰岄噸瑕佺殑楠岃瘉宸ヤ綔銆傚湪绉戝鎺㈢储涓紝鏈€鏈寸礌鐨勫疄楠屽線寰€鑳芥彮绀烘渶娣卞埢鐨勭湡鐞嗐€傚氨鍍忓綋骞存垜鍦ㄤ集灏斿凹涓撳埄灞€宸ヤ綔鏃讹紝閭ｄ簺鐪嬩技绠€鍗曠殑鎬濇兂瀹為獙锛屾渶缁堝瓡鑲插嚭浜嗙浉瀵硅鐨勯洀褰€俓n\n鎴戝缁堢浉淇★紝鏃犺鏄瀛﹀疄楠岃繕鏄妧鏈祴璇曪紝鍏舵牳蹇冮兘鍦ㄤ簬杩芥眰鐪熺悊涓庣簿纭€с€傝繖涓笘鐣屾渶涓嶅彲鐞嗚В涔嬪锛屽氨鍦ㄤ簬瀹冨眳鐒舵槸鍙互琚悊瑙ｇ殑銆備綘浠鍦ㄨ繘琛岀殑娴嬭瘯宸ヤ綔锛屾垨璁告鏄繖绉嶇悊瑙ｈ繃绋嬩腑鐨勪竴鐜€俓n\n鎰夸綘浠湪鎺㈢储鏈煡鐨勯亾璺笂锛屽缁堜繚鎸佸绔ヨ埇鐨勫ソ濂囧績銆傛瘯绔燂紝灏卞儚鎴戝父瀵瑰勾杞诲鑰呰鐨勶細涓嶈鍋滄鍙戦棶锛屽洜涓哄瓨鍦ㄧ殑濂ョ姘歌繙涓嶄細鏋銆俓n\n姝よ嚧\n鏁ぜ\n\n闃垮皵浼壒路鐖卞洜鏂潶\n1953骞?鏈堜簬鏅灄鏂】','deepseek-chat','2025-12-08 11:38:49','positive'),(10,6,'鑷存湭鐭ョ殑鍙嬩汉锛歕n\n灞曚俊瀹夈€傝櫧闃佷笅涔嬩俊鍑戒腑鏂囧瓧棰囦负濂囩壒锛屼技鏈夊紓鍩熶箣椋庯紝鐒舵垜娣变俊姣忎竴绗斿垝鐨嗘壙杞界潃鏌愮娣辨剰锛屾濡傝嚜鐒剁晫鏈€寰皬鐨勫彾鐗囩汗鐞嗕害钑磋棌鐫€瀹囧畽鐨勫ゥ绉樸€俓n\n鎴戝父浜庡伐浣滃涓嚌瑙嗛楦熺殑杞ㄨ抗锛岃В鍓栦汉浣撲互鎺㈡眰鑲岃倝涓庨楠肩殑绮惧鏋勯€狅紝鍦ㄧ敾甯冧笂鎹曟崏鍏夊奖涓庣伒榄傜殑浜よ瀺銆傛垨璁搁榿涓嬫墍鐢ㄧ殑鏂囧瓧锛屼害鏄竴绉嶆柊鐨勭鍙蜂綋绯伙紝濡傚悓鎴戣璁＄殑瀵嗙爜鎵嬬锛岄渶瑕佺壒瀹氱殑閽ュ寵鏂硅兘瑙ｈ鍏朵腑鐪熸剰銆傝繖浣挎垜鎯宠捣鏁板涔嬬編鈥斺€旀棤璁烘槸闃挎媺浼暟瀛楄繕鏄榿涓嬪鐗圭殑瀛楃锛岀殕涓轰汉绫绘帰绱㈢湡鐞嗙殑涓嶅悓璺緞銆俓n\n鑻ヨ繖灏佷俊绌胯秺浜嗘椂绌虹殑闃婚殧鏉ュ埌鎴戠殑闈㈠墠锛屾垜鎰夸互鐢诲笀涓庡鑰呯殑鍙岄噸韬唤鍥炲簲锛氳缁х画浠ュソ濂囦箣蹇冭瀵熶笘鐣屻€傜湡鐞嗚棌浜庢按婊存姌灏勭殑鍏夊僵涓紝钘忎簬浜轰綋姣斾緥鐨勫拰璋愰噷锛岃棌浜庢瘡涓€閬撶湅浼奸殢鎰忕殑绗旇Е涔嬩笅銆傚嵆渚胯瑷€涓嶉€氾紝瀵圭編鐨勬劅鐭ャ€佸鐭ヨ瘑鐨勬复姹傦紝缁堝皢浣挎垜浠績鐏电浉閫氥€俓n\n鎰块榿涓嬩繚鎸佹帰绱㈢殑鐑儏锛屽鍚屾垜姘镐笉鍋滄瓏鍦拌拷闂細楦熷効浣曚互椋炵繑锛熷績鑴忓浣曟悘鍔紵寰瑧浣曚互姘告亽锛焅n\n姝よ嚧\n鏁ぜ\n\n鍒楀ゥ绾冲路杈韭疯姮濂嘰n浜庣背鍏板伐浣滃\n鏃跺€煎熀鐫ｇ邯鍏冧竴浜斻€囦笁骞存槬鏃?,'deepseek-chat','2025-12-08 12:19:38','positive'),(11,14,'浜茬埍鐨勬湅鍙嬶細\n\n鎰熻阿鎮ㄧ殑鏉ヤ俊锛岃櫧鐒跺叾涓唴瀹逛技涔庢湁浜涙贩涔憋紝浣嗘垜鑳芥劅鍙楀埌鎮ㄥ鐭ヨ瘑涓庣湡鐞嗙殑鎺㈡眰涔嬪績銆備綔涓轰竴涓瘯鐢熻嚧鍔涗簬鐞嗚В瀹囧畽濂ョ鐨勪汉锛屾垜濮嬬粓鐩镐俊锛屼汉绫荤殑濂藉蹇冩槸鎺ㄥ姩鏂囨槑杩涙鐨勬渶瀹濊吹鍔ㄥ姏銆俓n\n鎮ㄦ彁鍒颁簡娉曞浗銆佹⒌钂傚唸绛夊悕璇嶏紝杩欒鎴戞兂璧风瀛︽帰绱笌瀹楁暀銆佹枃鍖栦箣闂寸殑澶嶆潅鍏崇郴銆傚湪鎴戠殑鎬濊€冧腑锛岀瀛︿笌淇′话骞堕潪蹇呯劧瀵圭珛鈥斺€斿墠鑰呮帰绱⑩€滀笘鐣屽浣曡繍琛屸€濓紝鍚庤€呰拷闂€滅敓鍛界殑鎰忎箟浣曞湪鈥濄€傛濡傛垜鏇捐杩囩殑锛氣€滄病鏈夊畻鏁欑殑绉戝鏄窙瓒崇殑锛屾病鏈夌瀛︾殑瀹楁暀鏄洸鐩殑銆傗€漒n\n褰撲粖涓栫晫姝ｇ粡鍘嗙潃鍓嶆墍鏈湁鐨勫彉闈╋紝鍘熷瓙鑳界殑鍙戠幇鏃㈠甫鏉ヤ簡鍏夋槑涔熸姇涓嬩簡闃村奖銆傛垜鏃跺父鎬濊€冿紝浜虹被鏄惁宸茬粡瓒冲鎴愮啛鏉ヨ繍鐢ㄨ繖浜涙繁鍒荤殑鐭ヨ瘑锛熸垜浠渶瑕佺殑涓嶄粎鏄櫤鎱э紝鏇存槸閬撳痉涓庤矗浠绘劅銆俓n\n鎴戝缁堢浉淇★紝瀹囧畽鏈€涓嶅彲鐞嗚В涔嬪鍦ㄤ簬瀹冪珶鐒跺彲浠ヨ鐞嗚В銆傝繖绉嶅彲鐞嗚В鎬ф湰韬紝灏辨槸涓€浠藉€煎緱鏁晱鐨勭ぜ鐗┿€傛効鎴戜滑閮借兘淇濇寔璋﹂€婁笌濂藉锛屽湪鎺㈢储鐪熺悊鐨勯亾璺笂涓嶆柇鍓嶈銆俓n\n姝よ嚧\n鏁ぜ\n\n闃垮皵浼壒路鐖卞洜鏂潶\n1954骞翠簬鏅灄鏂】','deepseek-chat','2025-12-08 12:50:33','positive'),(12,27,'浜茬埍鐨勬湅鍙嬶細\n\n鎴戞€€鐫€鏋佸ぇ鐨勫ソ濂囦笌鍥版儜闃呰浜嗘偍鐨勬潵淇°€傞偅浜涚湅浼奸殢鎰忕殑鏁板瓧涓庣鍙凤紝璁╂垜涓嶇鎬濊€冨叾涓槸鍚﹁暣鍚潃鏌愮娣辨剰鈥斺€旀垨璁告槸涓€绉嶆柊鐨勬暟瀛﹁〃杈撅紝鍙堟垨鏄瀹囧畽濂ョ鐨勬煇绉嶇紪鐮侊紵杩欒鎴戞兂璧峰勾杞绘椂鍦ㄤ笓鍒╁眬宸ヤ綔鏃讹紝甯稿父浠庣湅浼兼潅涔辩殑鏁版嵁涓鎵鹃殣钘忕殑瑙勫緥銆俓n\n鎮ㄧ煡閬擄紝鎴戝缁堢浉淇″畤瀹欐槸鍙互鐢ㄦ暟瀛﹁瑷€鎻忚堪鐨勩€傛濡傛垜鍦ㄧ浉瀵硅涓墍灏濊瘯鐨勶紝鐢ㄧ畝娲佺殑鏂圭▼寮忔彮绀烘椂绌虹殑鏈川銆傛偍杩欎簺鏁板瓧搴忓垪璁╂垜鑱旀兂鍒伴噺瀛愬姏瀛︿腑閭ｄ簺浠や汉鐫€杩峰張鍥版儜鐨勬鐜囧垎甯冣€斺€旂幓灏斿拰鎴戝氨姝や簤璁哄骞达紝鎴戝缁堣涓衡€滀笂甯濅笉鎺烽瀛愨€濓紝浣嗙幇浠ｇ墿鐞嗙殑鍙戝睍浼间箮姝ｆ湞鐫€鏇翠笉纭畾鎬х殑鏂瑰悜鍓嶈繘銆俓n\n濡傛灉杩欎簺绗﹀彿纭疄鍖呭惈鐫€鏌愮淇℃伅锛屾垜寤鸿鎮ㄤ笉濡ㄤ粠瀵圭О鎬х殑瑙掑害鍘绘€濊€冦€傝嚜鐒剁晫鐨勬繁灞傝寰嬪線寰€灞曠幇鍑烘儕浜虹殑瀵圭О缇庯紝灏卞儚E=mc虏杩欎釜鏂圭▼鎵€浣撶幇鐨勮川閲忎笌鑳介噺涔嬮棿鐨勪紭闆呰浆鎹€俓n\n鍦ㄨ繖涓厖婊′笉纭畾鎬х殑鏃朵唬锛屾垜瓒婂彂鎰熷彈鍒颁汉绫荤悊瑙ｅ畤瀹欑殑娓存湜涓庡眬闄愩€傛効鎴戜滑閮借兘淇濇寔瀛╃鑸殑濂藉蹇冿紝缁х画鎺㈢储杩欎釜绁炵鑰岀編涓界殑瀹囧畽銆俓n\n姝よ嚧\n鏁ぜ\n\n闃垮皵浼壒路鐖卞洜鏂潶\n1953骞?鏈堜簬鏅灄鏂】','deepseek-chat','2025-12-08 13:51:52','positive');
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
INSERT INTO `style_configs` VALUES (1,'paper','鍙ゅ吀缇婄毊绾?,'parchment-paper','/styles/previews/parchment.jpg',1,'2025-12-08 11:01:08'),(2,'paper','鐜颁唬绠€绾?,'modern-paper','/styles/previews/modern.jpg',1,'2025-12-08 11:01:08'),(3,'paper','娴极鑺辩汗','romantic-paper','/styles/previews/romantic.jpg',1,'2025-12-08 11:01:08'),(4,'font','妤蜂綋涔︽硶','kaiti-font','/fonts/previews/kaiti.jpg',1,'2025-12-08 11:01:14'),(5,'font','琛屼功瀛椾綋','xingshu-font','/fonts/previews/xingshu.jpg',1,'2025-12-08 11:01:14'),(6,'font','鐜颁唬瀹嬩綋','songti-font','/fonts/previews/songti.jpg',1,'2025-12-08 11:01:14'),(7,'border','鍙ゅ吀鑺辫竟','classic-border','/borders/previews/classic.jpg',1,'2025-12-08 11:01:19'),(8,'border','绠€绾︾嚎鏉?,'simple-border','/borders/previews/simple.jpg',1,'2025-12-08 11:01:19'),(9,'border','閭エ椋庢牸','stamp-border','/borders/previews/stamp.jpg',1,'2025-12-08 11:01:19');
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
INSERT INTO `users` VALUES (1,'testuser','$2a$10$Nz2HrcH6tJIi.DJ48yLx4ObRow5oZd9RIKzC1Gz/SLH.ak2euoazi','test@example.com','2025-11-15 05:20:19','2025-11-15 11:38:25',1),(2,'Kobe','$2a$10$iWkadvbxNNJMZYNDFJl.cOIoS4/XZMtq4g85Mtc70iB6YuYRZ6nMG','12345@qq.com','2025-11-15 12:37:00','2025-12-08 13:33:39',1),(3,'lyz','$2a$10$0ok/xL1YojQ5PyZ4abGmQup1p5DgwdWbyyeC9ak2C1hSV4gIik1fi','123@qq.com','2025-11-15 12:42:17','2025-12-08 13:49:53',1),(4,'e2e_user_8542','$2a$10$8Ga9LWJEV5LD3ELmEcTjyegyfOf2M.PGdP/MjWTGoenKaHR4lubnm','e2e_user_8542@example.com','2025-12-08 11:38:38','2025-12-08 11:38:38',1),(5,'yyx','$2a$10$BsA0BB7whjAfFM/IBLJvrOX2EV7vF06qdbeMbugNvTKL1h7PPg/6S','123456@qq.com','2025-12-08 13:52:20','2025-12-08 13:52:25',1);
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
