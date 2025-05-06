-- Create the reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  title VARCHAR(100) DEFAULT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product_review (user_id,product_id)
);

-- Add an index for faster product review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);

-- Add an index for faster user review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews (user_id);

-- For testing: insert a sample review
-- INSERT INTO reviews (product_id, user_id, rating, title, content) 
-- VALUES (1, 1, 4.5, 'Great product', 'I really enjoyed using this product.'); 