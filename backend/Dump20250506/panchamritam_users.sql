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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone_number` varchar(15) DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `google_email` varchar(100) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User','test@example.com','$2b$10$3Ey3Ctx6HeqEbQuBPW0fyuhBarZaIF6wNzKtLhYRCxyIhJ0MpWOwK',2,'2025-04-21 10:13:28',NULL,NULL,NULL,NULL),(2,'Admin User','admin@greenmagic.com','$2b$10$Es1PlOB/o/xbaEYG1tRh2u.4VFm6YRVTLBHV5sX2184zKHCOEetru',1,'2025-04-21 10:39:26',NULL,NULL,NULL,NULL),(3,'Test User 2','test2@example.com','$2b$10$GRG3ReRMkhpTJ3bv7TITJ.EnW.uUQqmv4c40gEXNxt97BzDXe6ODW',2,'2025-04-21 10:40:46',NULL,NULL,NULL,NULL),(4,'New Admin','newadmin@example.com','$2b$10$PBhcCFr3fqALwvAgqJ6kWeq/eYCweBmhBaJsNlGT3daosC6aPM4HG',1,'2025-04-21 10:52:10',NULL,NULL,NULL,NULL),(5,'Test1','test1@gmail.com','$2b$10$0n6w.JsVb5nVZ7N.OXMHpuDxQoCNCePMt1YqZoKtgbcTw5fQ.fWz2',2,'2025-04-24 10:29:26',NULL,NULL,NULL,NULL),(6,'test2','test2@gmail.com','$2b$10$rJpH.jrk9kbgLVUtAYXdqOxdeywzHA8Y1PboMKGUH6zrM3uJCJHj6',2,'2025-04-24 10:54:18',NULL,NULL,NULL,NULL),(7,'test4','test4@gmail.com','$2b$10$y0OnTWzBfLDG700x0X/6D.f12lTxZgapj2GcoBxtkSeAty7UOdZYe',2,'2025-04-24 11:19:01',NULL,NULL,NULL,NULL),(8,'test5','test5@gmail.com','$2b$10$1u7ZRQnqgF9L4yUXkH2nl.E.uiow4U25knxwMM/ojlwH6XOxKEB7W',2,'2025-04-24 11:30:04',NULL,NULL,NULL,NULL),(9,'test6','test6@gmail.com','$2b$10$qNJzaDSJklH6pG/LHRmOTuoridpD0gOfc9KPcJSX1u1g8RZjZ2FWO',2,'2025-04-24 12:43:22',NULL,NULL,NULL,NULL),(10,'green magic farming','green@gmail.com','$2b$10$o0bI7t.lh3ho9xWQaUP0sOxJVA2s0Xmt40DCfCaEcDwP6F9XODbwm',2,'2025-04-28 07:34:15',NULL,NULL,NULL,NULL),(11,'Thakur Ajay','ajaysingh261526@gmail.com',NULL,1,'2025-04-28 11:11:30',NULL,'117361841202462409344','ajaysingh261526@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocLo45jmVFIiT4bXhjOVJTXLffdmX9mI7uSD6oURNL0WvuVj0Bs=s96-c'),(12,'PANCHAMRITAM','panchamritamnatural@gmail.com',NULL,2,'2025-04-28 11:30:13',NULL,'116162373898278670240','panchamritamnatural@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocK-PYyNhz6yk1Chvn5soz0Wu_ywDz8JZTnUpBil3XIEhYU4Dw=s96-c'),(13,'Thakur Ajay','cadt142615@gmail.com',NULL,2,'2025-04-28 11:32:23',NULL,'113813692771245690240','cadt142615@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocIuojDVLTO3pA050FeA_tu__q1rRVm1AmIC4gjTAqtba4__6A=s96-c'),(14,'Ajay Singh','iamcadt14@gmail.com',NULL,2,'2025-04-28 11:53:44',NULL,'116771580541686528095','iamcadt14@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocKgf_Y72O0CXNfFctOh-uht9I2ugteWcev0aVQEdvEN4bRn2Q=s96-c');
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

-- Dump completed on 2025-05-06 15:15:35
