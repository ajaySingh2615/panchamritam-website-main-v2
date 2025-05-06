-- Migration script to add new fields to the Addresses table

-- Add name column
ALTER TABLE Addresses
ADD COLUMN name VARCHAR(100);

-- Add address_type column
ALTER TABLE Addresses
ADD COLUMN address_type ENUM('Home', 'Office', 'Other') DEFAULT 'Home';

-- Add is_default column
ALTER TABLE Addresses
ADD COLUMN is_default BOOLEAN DEFAULT FALSE;

-- Add created_at column
ALTER TABLE Addresses
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index on user_id and is_default for faster lookups
CREATE INDEX idx_user_addresses ON Addresses(user_id, is_default);

-- Update existing addresses with default values
UPDATE Addresses SET name = 'Default Address' WHERE name IS NULL;

-- Log migration completion in a special table (create if not exists)
CREATE TABLE IF NOT EXISTS Migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Migrations (name) VALUES ('add_address_fields'); 