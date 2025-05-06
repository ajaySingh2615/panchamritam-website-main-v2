-- Migration script to remove status column from Reviews table
-- This change makes all reviews show immediately without moderation

-- First, drop the index on the status column if it exists
DROP INDEX IF EXISTS idx_reviews_status ON Reviews;

-- Then, remove the status column from the Reviews table
ALTER TABLE Reviews DROP COLUMN status;

-- Update the triggers to not reference status
DELIMITER $$

-- Drop existing triggers first
DROP TRIGGER IF EXISTS after_review_insert $$
DROP TRIGGER IF EXISTS after_review_update $$
DROP TRIGGER IF EXISTS after_review_delete $$

-- Recreate the triggers without status filtering
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
            WHERE r.product_id = NEW.product_id
        ),
        p.review_count = (
            SELECT COUNT(*) 
            FROM Reviews r 
            WHERE r.product_id = NEW.product_id
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
            WHERE r.product_id = NEW.product_id
        ),
        p.review_count = (
            SELECT COUNT(*) 
            FROM Reviews r 
            WHERE r.product_id = NEW.product_id
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
             WHERE r.product_id = OLD.product_id),
            0
        ),
        p.review_count = (
            SELECT COUNT(*) 
            FROM Reviews r 
            WHERE r.product_id = OLD.product_id
        )
    WHERE p.product_id = OLD.product_id;
END$$

DELIMITER ; 