-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: panchamritam
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `short_description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `regular_price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `free_shipping` tinyint(1) DEFAULT '0',
  `shipping_time` varchar(50) DEFAULT '3-5 business days',
  `warranty_period` int DEFAULT NULL,
  `eco_friendly` tinyint(1) DEFAULT '1',
  `eco_friendly_details` varchar(255) DEFAULT 'Eco-friendly packaging',
  `rating` decimal(2,1) DEFAULT '0.0',
  `review_count` int DEFAULT '0',
  `tags` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','draft') DEFAULT 'active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,NULL,'Premium Organic Apples','Fresh organic apples sourced from local farms',NULL,3.49,NULL,748,2,NULL,'https://example.com/images/bananas.jpg',0,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,NULL,0,'active',2,'2025-04-22 07:01:38'),(4,NULL,'Organic Apples - 2','Fresh organic apples sourced from local farms',NULL,3.99,NULL,500,4,NULL,'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?t=st=1745923615~exp=1745927215~hmac=b6878caa0f97b96d635ae9c7c55a2ff11c366ee90b92128358f67426511476d2&w=900',0,'3-5 business days',NULL,1,'Eco-friendly packaging',NULL,0,NULL,0,'active',2,'2025-04-29 10:49:55'),(5,NULL,'Organic Apples - 3','Fresh organic apples sourced from local farms',NULL,3.99,NULL,500,4,NULL,'https://img.freepik.com/free-photo/green-apple-with-leaves_1101-453.jpg?t=st=1745924733~exp=1745928333~hmac=492c09832637450ad62f1ba635abeb4a78a606557f80eeeb67990c13b4092031&w=1380',0,'3-5 business days',NULL,1,'Eco-friendly packaging',NULL,0,NULL,0,'active',2,'2025-04-29 11:08:21');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-02 18:28:09
