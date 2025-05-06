-- Migration script to create Reviews table
-- This tracks product ratings and comments from users

CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    title VARCHAR(100),
    content TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    -- Prevent duplicate reviews from the same user for the same product
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Add index for faster queries
CREATE INDEX idx_reviews_product ON Reviews(product_id);
CREATE INDEX idx_reviews_user ON Reviews(user_id);
CREATE INDEX idx_reviews_status ON Reviews(status);

-- Create a trigger to update product rating when a review is added/updated/deleted
DELIMITER $$

CREATE TRIGGER after_review_insert
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
    -- Calculate new average rating
    UPDATE Products p
    SET 
        p.rating = (
            SELECT AVG(r.rating) 
            FROM Reviews r 
            WHERE r.product_id = NEW.product_id AND r.status = 'approved'
        ),
        p.review_count = (
            SELECT COUNT(*) 
            FROM Reviews r 
            WHERE r.product_id = NEW.product_id AND r.status = 'approved'
        )
    WHERE p.product_id = NEW.product_id;
END$$

CREATE TRIGGER after_review_update
AFTER UPDATE ON Reviews
FOR EACH ROW
BEGIN
    -- Calculate new average rating
    UPDATE Products p
    SET 
        p.rating = (
            SELECT AVG(r.rating) 
            FROM Reviews r 
            WHERE r.product_id = NEW.product_id AND r.status = 'approved'
        ),
        p.review_count = (
            SELECT COUNT(*) 
            FROM Reviews r 
            WHERE r.product_id = NEW.product_id AND r.status = 'approved'
        )
    WHERE p.product_id = NEW.product_id;
END$$

CREATE TRIGGER after_review_delete
AFTER DELETE ON Reviews
FOR EACH ROW
BEGIN
    -- Calculate new average rating
    UPDATE Products p
    SET 
        p.rating = COALESCE(
            (SELECT AVG(r.rating) 
             FROM Reviews r 
             WHERE r.product_id = OLD.product_id AND r.status = 'approved'),
            0
        ),
        p.review_count = (
            SELECT COUNT(*) 
            FROM Reviews r 
            WHERE r.product_id = OLD.product_id AND r.status = 'approved'
        )
    WHERE p.product_id = OLD.product_id;
END$$

DELIMITER ; 