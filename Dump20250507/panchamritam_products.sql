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
  `barcode` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `description` text,
  `short_description` varchar(255) DEFAULT NULL,
  `ingredients` text,
  `shelf_life` varchar(50) DEFAULT NULL,
  `storage_instructions` text,
  `usage_instructions` text,
  `price` decimal(10,2) DEFAULT NULL,
  `regular_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `min_stock_alert` int DEFAULT NULL,
  `unit_of_measurement` varchar(20) DEFAULT NULL,
  `package_size` varchar(50) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `subcategory_id` int DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `gallery_images` json DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `meta_title` varchar(100) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `free_shipping` tinyint(1) DEFAULT '0',
  `shipping_time` varchar(50) DEFAULT '3-5 business days',
  `warranty_period` int DEFAULT NULL,
  `eco_friendly` tinyint(1) DEFAULT '1',
  `eco_friendly_details` varchar(255) DEFAULT 'Eco-friendly packaging',
  `rating` decimal(2,1) DEFAULT '0.0',
  `review_count` int DEFAULT '0',
  `tags` varchar(255) DEFAULT NULL,
  `weight_for_shipping` decimal(10,2) DEFAULT NULL,
  `dimensions` varchar(50) DEFAULT NULL,
  `delivery_time_estimate` varchar(50) DEFAULT NULL,
  `is_returnable` tinyint(1) DEFAULT '1',
  `is_cod_available` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_best_seller` tinyint(1) DEFAULT '0',
  `is_new_arrival` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','draft') DEFAULT 'active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `hsn_code_id` int DEFAULT NULL,
  `is_branded` tinyint(1) DEFAULT '0',
  `is_packaged` tinyint(1) DEFAULT '0',
  `custom_gst_rate_id` int DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_products_slug` (`slug`),
  KEY `idx_products_subcategory` (`subcategory_id`),
  KEY `idx_products_barcode` (`barcode`),
  KEY `hsn_code_id` (`hsn_code_id`),
  KEY `custom_gst_rate_id` (`custom_gst_rate_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `products_ibfk_3` FOREIGN KEY (`hsn_code_id`) REFERENCES `hsn_codes` (`hsn_id`),
  CONSTRAINT `products_ibfk_4` FOREIGN KEY (`custom_gst_rate_id`) REFERENCES `gst_rates` (`rate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,NULL,NULL,'Premium Organic Apples',NULL,'Fresh organic apples sourced from local farms',NULL,NULL,NULL,NULL,NULL,3.49,NULL,NULL,748,NULL,NULL,NULL,2,NULL,NULL,'https://example.com/images/bananas.jpg',NULL,NULL,NULL,NULL,0,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,NULL,NULL,NULL,NULL,1,1,0,0,0,'active',2,'2025-04-22 07:01:38',NULL,0,0,NULL),(4,NULL,NULL,'Organic Apples - 2',NULL,'Fresh organic apples sourced from local farms',NULL,NULL,NULL,NULL,NULL,3.99,NULL,NULL,500,NULL,NULL,NULL,4,NULL,NULL,'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?t=st=1745923615~exp=1745927215~hmac=b6878caa0f97b96d635ae9c7c55a2ff11c366ee90b92128358f67426511476d2&w=900',NULL,NULL,NULL,NULL,0,'3-5 business days',NULL,1,'Eco-friendly packaging',NULL,0,NULL,NULL,NULL,NULL,1,1,0,0,0,'active',2,'2025-04-29 10:49:55',NULL,0,0,NULL),(5,NULL,NULL,'Organic Apples - 3',NULL,'Fresh organic apples sourced from local farms',NULL,NULL,NULL,NULL,NULL,3.99,NULL,NULL,500,NULL,NULL,NULL,4,NULL,NULL,'https://img.freepik.com/free-photo/green-apple-with-leaves_1101-453.jpg?t=st=1745924733~exp=1745928333~hmac=492c09832637450ad62f1ba635abeb4a78a606557f80eeeb67990c13b4092031&w=1380',NULL,NULL,NULL,NULL,0,'3-5 business days',NULL,1,'Eco-friendly packaging',NULL,0,NULL,NULL,NULL,NULL,1,1,0,0,0,'active',2,'2025-04-29 11:08:21',NULL,0,0,NULL),(6,NULL,NULL,'Pineapple – A Sweet and Juicy Tropical Fruit',NULL,'Pineapple is a tropical fruit that is loved by people all over the world. It is large, oval or round in shape, and has a tough, spiky skin. The skin is green when raw and turns yellow or golden when ripe. Inside, the fruit is yellow, juicy, and sweet with a little sour taste. It has a strong and refreshing smell that makes it very tempting.\n\nPineapples are rich in vitamins, especially Vitamin C, which helps boost your immune system. It also has fiber, which is good for digestion, and an enzyme called bromelain, which helps in reducing inflammation and helps the body break down protein.\n\nYou can eat pineapple in many ways. It can be eaten fresh, as slices or cubes. You can also make juice, smoothies, jams, or add it to salads, cakes, or pizzas. It is also used in cooking many dishes, especially in Asian and tropical recipes.\n\nPineapples grow well in warm and sunny places. They are mostly grown in countries like Thailand, the Philippines, India, and Costa Rica. It takes many months for a pineapple plant to grow and produce one full fruit.\n\nThis fruit not only tastes good but also helps keep you healthy. It is fat-free, low in calories, and full of nutrients. Whether you want a quick snack or something to refresh you on a hot day, pineapple is a perfect choice.',NULL,NULL,NULL,NULL,NULL,40.00,NULL,NULL,10,NULL,NULL,NULL,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,NULL,NULL,NULL,NULL,1,1,0,0,0,'active',11,'2025-05-03 10:19:35',NULL,0,0,NULL),(7,'GM-1746271790145',NULL,'Grapes',NULL,'Grapes are small, round fruits that grow in bunches on vines. They come in different colors like green, red, black, and purple. Grapes have smooth skin, soft juicy flesh, and a sweet or slightly sour taste, depending on the type. Some grapes have seeds, while others are seedless.\n\nGrapes are very healthy. They are rich in vitamins C and K, antioxidants, and fiber. Antioxidants in grapes, especially resveratrol, are good for your heart and help keep your skin young and glowing. They also improve blood flow and boost energy.\n\nYou can eat grapes fresh, dry them to make raisins, or use them to make juice, jelly, and wine. They are perfect for snacks, fruit salads, or even cooking.\n\nGrapes grow in warm places and are mostly farmed in India, Italy, the USA, and Chile. They are one of the most loved fruits around the world because of their sweet taste, health benefits, and many uses.\n\n','Grapes are small, juicy fruits that grow in bunches and come in green, red, or purple colors. They are sweet or slightly sour and can be eaten fresh o',NULL,NULL,NULL,NULL,60.00,70.00,NULL,5,NULL,NULL,NULL,1,NULL,'GreenMagic',NULL,NULL,NULL,NULL,NULL,1,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,'#Grapes  #FreshGrapes  #JuicyFruit  #HealthySnack  #Antioxidants  #VitaminC  #SeedlessGrapes  #FruitLovers  #HeartHealthy  #NaturalSweetness  #GreenGrapes  #RedGrapes  #PurpleGrapes  #GrapeJuice  #OrganicFruits',NULL,NULL,NULL,1,1,1,0,0,'active',11,'2025-05-03 11:29:50',NULL,0,0,NULL),(8,'GM-1746272260280',NULL,'sfds',NULL,'fdsfds','dfvdsf',NULL,NULL,NULL,NULL,33.00,35.00,NULL,5,NULL,NULL,NULL,3,NULL,'GreenMagic',NULL,NULL,NULL,NULL,NULL,1,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,'fff',NULL,NULL,NULL,1,1,1,0,0,'active',11,'2025-05-03 11:37:40',NULL,0,0,NULL),(9,'GM-1746427349499',NULL,'GreenMagic Premium Tea',NULL,'GreenMagic Premium Tea is a rich and aromatic blend made from handpicked tea leaves grown in the finest gardens. With every sip, you enjoy bold flavor, natural freshness, and a soothing aroma. Perfect for mornings or a relaxing evening break. This tea helps boost energy, supports digestion, and keeps you refreshed all day.','Refreshing blend of handpicked tea leaves for a rich taste and energizing feel.',NULL,NULL,NULL,NULL,199.00,249.00,NULL,100,NULL,NULL,NULL,6,NULL,'GreenMagic',NULL,NULL,NULL,NULL,NULL,1,'3-5 business days',NULL,1,'Packed in recyclable, environment-safe pouches. No plastic used.',0.0,0,'tea, premium tea, assam tea, energy booster, greenmagic, natural tea, healthy tea, Indian tea, morning tea, fresh tea',NULL,NULL,NULL,1,1,1,0,0,'active',11,'2025-05-05 06:42:29',NULL,0,0,NULL),(10,'GM-1746428816813',NULL,'GreenMagic Copper Water Bottle – 1L','greenmagic-copper-water-bottle-1l','This GreenMagic Copper Water Bottle is made from 100% pure copper, known in Ayurveda for its health benefits. Drinking water stored in a copper bottle may help improve digestion, immunity, and overall wellness. The bottle is leak-proof, easy to carry, and ideal for home, office, or travel use.','100% pure copper bottle for better health, improved immunity, and natural cooling.','100% Pure Copper','Does not expire','Keep dry. Clean regularly with lemon + salt for shine.','Store drinking water in the bottle overnight. Consume on an empty stomach in the morning.',599.00,749.00,400.00,200,10,'bottle','1L',9,NULL,'GreenMagic',NULL,'[]',NULL,'GreenMagic Copper Water Bottle – Pure Copper | 1 Liter','Shop GreenMagic Copper Bottle online. Made with 100% copper for health & immunity. 1L capacity, leak-proof, eco-friendly, fast delivery.',1,'3-5 business days',6,1,'Reusable, 100% recyclable, no plastic used.',0.0,0,'copper bottle, water bottle, health bottle, ayurvedic bottle, eco bottle, copper flask, GreenMagic bottle',0.45,'27x7x7','3-5 business days',1,1,1,1,1,'active',11,'2025-05-05 07:06:56',NULL,0,0,NULL),(11,'GM-1746430881229',NULL,'GreenMagic SmoothFlow Ball Pen – Blue Ink','greenmagic-smoothflow-ball-pen-blue','GreenMagic SmoothFlow Ball Pen is designed for effortless writing. It features a soft grip, fine tip, and long-lasting blue ink that dries quickly and writes smoothly on all types of paper. Ideal for students, professionals, and daily writing tasks.','Smooth writing pen with long ink life, perfect for school, office, and daily use.','Plastic body, blue ink, metal tip','24 months','Keep capped when not in use. Store in a cool, dry place.','Uncap the pen and write on paper. Recap after use to prevent drying.',10.00,15.00,6.00,500,20,'pcs','10g',9,NULL,'GreenMagic',NULL,'[]',NULL,'GreenMagic SmoothFlow Ball Pen – Blue Ink | Smooth Writing','Buy GreenMagic Ball Pen online. Smooth writing experience, blue ink, soft grip, affordable price. Ideal for students and professionals.',1,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,'pen, ball pen, writing pen, blue pen, smooth pen, school stationery, office pen, GreenMagic pen',0.01,'14x1x1','3-5 business days',1,1,1,1,1,'active',11,'2025-05-05 07:41:21',NULL,0,0,NULL),(12,'GM-1746436131091',NULL,'a','a','fdsfdf','dsf','sfrfg','sdff','dvfd','fgv',12.50,12.00,22.60,5,5,'pcs',NULL,3,NULL,'GreenMagic',NULL,'[]',NULL,'dsfsdf','sdfs',1,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,'dffdf',2.00,'10*5*2','3-5 business days',1,1,1,1,1,'active',11,'2025-05-05 09:08:51',NULL,0,0,NULL),(13,'GM-1746436551530',NULL,'GreenMagic SmoothFlow Ball Pen – Blue Ink-2','greenmagic-smoothflow-ball-pen-blue-2','GreenMagic SmoothFlow Ball Pen is designed for effortless writing. It features a soft grip, fine tip, and long-lasting blue ink that dries quickly and writes smoothly on all types of paper. Ideal for students, professionals, and daily writing tasks.','Smooth writing pen with long ink life, perfect for school, office, and daily use.','Plastic body, blue ink, metal tip','24 months','Keep capped when not in use. Store in a cool, dry place.','Uncap the pen and write on paper. Recap after use to prevent drying.',10.00,15.00,6.00,500,20,'pcs','10g',9,NULL,'GreenMagic','https://res.cloudinary.com/dzaphdeoy/image/upload/v1746436554/panchamritam-products/image-1746436551559-723546096_fae1pj.webp','[{\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746436555/panchamritam-products/images-1746436555188-657164939_jxcqv2.webp\", \"public_id\": \"panchamritam-products/images-1746436555188-657164939_jxcqv2\"}, {\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746436557/panchamritam-products/images-1746436555188-165625361_bm2dd6.webp\", \"public_id\": \"panchamritam-products/images-1746436555188-165625361_bm2dd6\"}, {\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746436557/panchamritam-products/images-1746436555189-731201914_vfmdsr.webp\", \"public_id\": \"panchamritam-products/images-1746436555189-731201914_vfmdsr\"}]',NULL,'GreenMagic SmoothFlow Ball Pen – Blue Ink | Smooth Writing','Buy GreenMagic Ball Pen online. Smooth writing experience, blue ink, soft grip, affordable price. Ideal for students and professionals.',1,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,'pen, ball pen, writing pen, blue pen, smooth pen, school stationery, office pen, GreenMagic pen',0.01,'14x1x1','3-5 business days',1,1,1,1,1,'active',11,'2025-05-05 09:15:51',NULL,0,0,NULL),(14,'GM-1746438852212',NULL,'GreenMagic Premium Instant Coffee – 100g','greenmagic-premium-instant-coffee-100g','GreenMagic Premium Instant Coffee is crafted from high-quality roasted coffee beans for a bold aroma and rich taste. Quick to prepare, it dissolves instantly in hot or cold water. Perfect for morning energy or a mid-day break. No additives or preservatives – just pure coffee love.','Rich, aromatic instant coffee made from premium beans for a bold and smooth taste.','100% Instant Coffee','18 months','Store in a cool, dry place. Keep the lid tightly closed.','Add 1 tsp of coffee to hot water or milk. Stir well and enjoy.',249.00,299.00,170.00,150,10,'bottle','100g',6,NULL,'GreenMagic','https://res.cloudinary.com/dzaphdeoy/image/upload/v1746438855/panchamritam-products/image-1746438852243-610526807_fdpsbr.webp','[{\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746438856/panchamritam-products/images-1746438855906-65561066_citw9o.webp\", \"public_id\": \"panchamritam-products/images-1746438855906-65561066_citw9o\"}, {\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746438858/panchamritam-products/images-1746438855906-881184748_cttbzc.webp\", \"public_id\": \"panchamritam-products/images-1746438855906-881184748_cttbzc\"}]',NULL,'GreenMagic Premium Instant Coffee – Pure & Strong | 100g','Buy GreenMagic Instant Coffee online. Bold, rich taste with no preservatives. 100% pure coffee, 100g bottle, delivered to your door.',1,'3-5 business days',NULL,1,'Eco-friendly packaging',0.0,0,'coffee, instant coffee, pure coffee, strong coffee, premium coffee, GreenMagic coffee, energy drink, hot drink',0.15,'10x7x7','3-5 business days',1,1,1,1,1,'active',11,'2025-05-05 09:54:12',NULL,0,0,NULL),(15,'GM-1746510267491',NULL,'GreenMagic Classic Analog Watch – Black Dial & Leather Strap','greenmagic-classic-analog-watch-black','GreenMagic Classic Analog Watch combines elegance with everyday utility. It features a bold black dial, stainless steel case, and a premium leather strap that ensures comfort and class. Perfect for both formal and casual outfits, this watch is water-resistant and built to last.','Stylish analog watch with black dial and premium leather strap for men.','Stainless steel case, leather strap, quartz movement','36 months','Store in a cool, dry place. Avoid direct sunlight and moisture.','Wear on wrist. Use side crown to adjust time.',999.00,1499.00,700.00,100,5,'pcs','200g',8,NULL,'GreenMagic','https://res.cloudinary.com/dzaphdeoy/image/upload/v1746510270/panchamritam-products/image-1746510267531-511880809_ysdrsy.webp','[{\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746510271/panchamritam-products/images-1746510270223-28456139_h8zbvx.webp\", \"public_id\": \"panchamritam-products/images-1746510270223-28456139_h8zbvx\"}, {\"url\": \"https://res.cloudinary.com/dzaphdeoy/image/upload/v1746510272/panchamritam-products/images-1746510270224-600911512_fxovfs.webp\", \"public_id\": \"panchamritam-products/images-1746510270224-600911512_fxovfs\"}]',NULL,'GreenMagic Classic Analog Watch – Black Dial | Leather Strap','Shop GreenMagic’s stylish analog wristwatch with black dial & leather strap. Water-resistant, durable, and perfect for daily wear. 1-year warranty',1,'3-5 business days',NULL,1,'Comes in eco-friendly recycled box. Minimal plastic use',0.0,0,'watch, analog watch, leather strap, men’s watch, fashion watch, stylish watch, GreenMagic watch, classic wristwatch',0.20,'10x8x5','3-5 business days',1,1,1,1,1,'active',11,'2025-05-06 05:44:27',NULL,0,0,NULL);
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

-- Dump completed on 2025-05-07 18:31:26
