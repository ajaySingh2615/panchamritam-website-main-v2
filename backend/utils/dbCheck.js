/**
 * Utility to check and repair database tables
 */
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Check if the reviews table exists and has the required structure
 */
async function checkReviewsTable() {
  try {
    console.log('Checking if reviews table exists...');
    
    // Check if the table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reviews'
    `);
    
    if (tables.length === 0) {
      console.log('Reviews table does not exist. Creating it...');
      await createReviewsTable();
      return;
    }
    
    console.log('Reviews table exists, checking structure...');
    
    // Check if all required columns exist
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reviews'
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME.toLowerCase());
    
    const requiredColumns = [
      'review_id', 'product_id', 'user_id', 'rating', 
      'title', 'content', 'created_at'
    ];
    
    const missingColumns = requiredColumns.filter(
      col => !columnNames.includes(col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      console.log(`Missing columns: ${missingColumns.join(', ')}. Repairing table...`);
      await repairReviewsTable(missingColumns, columnNames);
    } else {
      console.log('Reviews table structure is valid.');
    }
  } catch (error) {
    console.error('Error checking reviews table:', error);
  }
}

/**
 * Create the reviews table
 */
async function createReviewsTable() {
  try {
    // Read the SQL script file
    const sqlPath = path.join(__dirname, '../sql/create_reviews_table.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('SQL script not found:', sqlPath);
      
      // Fallback to creating the table directly
      await pool.query(`
        CREATE TABLE reviews (
          review_id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          user_id INT NOT NULL,
          rating DECIMAL(2,1) NOT NULL,
          title VARCHAR(255),
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Created reviews table with fallback method.');
      return;
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute each statement separately
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('Created reviews table successfully.');
  } catch (error) {
    console.error('Error creating reviews table:', error);
  }
}

/**
 * Repair the reviews table by adding missing columns
 */
async function repairReviewsTable(missingColumns, existingColumns) {
  try {
    for (const column of missingColumns) {
      let columnDef = '';
      
      switch (column.toLowerCase()) {
        case 'review_id':
          if (!existingColumns.includes('id')) {
            columnDef = 'review_id INT AUTO_INCREMENT PRIMARY KEY';
          } else {
            // Rename 'id' to 'review_id' if it exists
            await pool.query('ALTER TABLE reviews CHANGE id review_id INT AUTO_INCREMENT');
            continue;
          }
          break;
          
        case 'product_id':
          columnDef = 'product_id INT NOT NULL';
          break;
          
        case 'user_id':
          columnDef = 'user_id INT NOT NULL';
          break;
          
        case 'rating':
          columnDef = 'rating DECIMAL(2,1) NOT NULL';
          break;
          
        case 'title':
          columnDef = 'title VARCHAR(255)';
          break;
          
        case 'content':
          columnDef = 'content TEXT';
          break;
          
        case 'created_at':
          columnDef = 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
          break;
          
        case 'updated_at':
          columnDef = 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
          break;
          
        default:
          console.log(`Skipping unknown column: ${column}`);
          continue;
      }
      
      if (columnDef) {
        await pool.query(`ALTER TABLE reviews ADD COLUMN ${columnDef}`);
        console.log(`Added column: ${column}`);
      }
    }
    
    console.log('Repaired reviews table successfully.');
  } catch (error) {
    console.error('Error repairing reviews table:', error);
  }
}

module.exports = {
  checkReviewsTable
}; 