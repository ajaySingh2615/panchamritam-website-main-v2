-- Migration script to add additional fields to Products table
-- This enhances the product database schema to better support the frontend features

-- Add SKU field for inventory management
ALTER TABLE Products ADD COLUMN sku VARCHAR(50) AFTER product_id;

-- Add brand field
ALTER TABLE Products ADD COLUMN brand VARCHAR(100) AFTER category_id;

-- Add regular_price for discount calculations
ALTER TABLE Products ADD COLUMN regular_price DECIMAL(10,2) AFTER price;

-- Add short_description for product cards and summaries
ALTER TABLE Products ADD COLUMN short_description VARCHAR(255) AFTER description;

-- Add fields for shipping options
ALTER TABLE Products ADD COLUMN free_shipping BOOLEAN DEFAULT FALSE AFTER image_url;
ALTER TABLE Products ADD COLUMN shipping_time VARCHAR(50) DEFAULT '3-5 business days' AFTER free_shipping;

-- Add fields for product guarantees
ALTER TABLE Products ADD COLUMN warranty_period INT DEFAULT NULL AFTER shipping_time;

-- Add sustainability fields
ALTER TABLE Products ADD COLUMN eco_friendly BOOLEAN DEFAULT TRUE AFTER warranty_period;
ALTER TABLE Products ADD COLUMN eco_friendly_details VARCHAR(255) DEFAULT 'Eco-friendly packaging' AFTER eco_friendly;

-- Add rating and review fields
ALTER TABLE Products ADD COLUMN rating DECIMAL(2,1) DEFAULT 0.0 AFTER eco_friendly_details;
ALTER TABLE Products ADD COLUMN review_count INT DEFAULT 0 AFTER rating;

-- Add tags field for better product searching and filtering
ALTER TABLE Products ADD COLUMN tags VARCHAR(255) AFTER review_count;

-- Add featured flag for showcasing special products on homepage
ALTER TABLE Products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER tags;

-- Add status field to control product visibility
ALTER TABLE Products ADD COLUMN status ENUM('active', 'inactive', 'draft') DEFAULT 'active' AFTER is_featured;

-- Update existing products 
-- For any that already exist, set sensible defaults for the new fields
UPDATE Products SET 
    sku = CONCAT('GM-', product_id),
    brand = 'GreenMagic',
    regular_price = price,
    short_description = SUBSTRING(description, 1, 150),
    eco_friendly = TRUE,
    status = 'active';

-- Optional: Add an index on SKU for faster lookups
CREATE INDEX idx_products_sku ON Products(sku); 