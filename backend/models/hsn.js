const { pool } = require('../config/db');

class HSN {
  // Get all HSN codes
  static async findAll(limit = 100, offset = 0) {
    try {
      // First check if the hsn_codes table exists
      const [tables] = await pool.query(`
        SELECT TABLE_NAME FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hsn_codes'
      `);
      
      if (tables.length === 0) {
        console.error('Table hsn_codes does not exist in the database');
        return [];
      }
      
      // Get the simple query results first
      const [simpleRows] = await pool.query(
        `SELECT * FROM hsn_codes LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );
      
      if (simpleRows.length > 0) {
        // Get the GST rate information separately
        const gstRateIds = simpleRows
          .filter(row => row.default_gst_rate_id)
          .map(row => row.default_gst_rate_id);
          
        if (gstRateIds.length > 0) {
          try {
            const [gstRates] = await pool.query(
              `SELECT * FROM gst_rates WHERE rate_id IN (?)`,
              [gstRateIds]
            );
              
            // Manually join the data
            const enhancedRows = simpleRows.map(hsnRow => {
              const matchingRate = gstRates.find(
                rate => rate.rate_id === hsnRow.default_gst_rate_id
              );
                
              if (matchingRate) {
                return {
                  ...hsnRow,
                  rate_name: matchingRate.rate_name,
                  percentage: matchingRate.percentage
                };
              }
                
              return {
                ...hsnRow,
                rate_name: null,
                percentage: null
              };
            });
              
            return enhancedRows;
          } catch (joinError) {
            console.error('Error fetching GST rates:', joinError);
            // If joining fails, just return the simple results
            return simpleRows;
          }
        } else {
          return simpleRows;
        }
      }
        
      return simpleRows;
    } catch (error) {
      console.error('Error in HSN.findAll:', error);
      // Return empty array instead of throwing error to prevent 500 error
      return [];
    }
  }

  // Get HSN code by ID
  static async findById(hsnId) {
    try {
      const [rows] = await pool.execute(
        `SELECT h.*, g.rate_name, g.percentage 
         FROM hsn_codes h
         LEFT JOIN gst_rates g ON h.default_gst_rate_id = g.rate_id
         WHERE h.hsn_id = ?`,
        [hsnId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in HSN.findById:', error);
      throw error;
    }
  }

  // Get HSN code by code
  static async findByCode(code) {
    try {
      const [rows] = await pool.execute(
        `SELECT h.*, g.rate_name, g.percentage 
         FROM hsn_codes h
         LEFT JOIN gst_rates g ON h.default_gst_rate_id = g.rate_id
         WHERE h.code = ?`,
        [code]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in HSN.findByCode:', error);
      throw error;
    }
  }

  // Create a new HSN code
  static async create(hsnData) {
    try {
      const { code, description, default_gst_rate_id } = hsnData;
      
      const [result] = await pool.execute(
        'INSERT INTO hsn_codes (code, description, default_gst_rate_id) VALUES (?, ?, ?)',
        [code, description, default_gst_rate_id]
      );
      
      return {
        hsn_id: result.insertId,
        ...hsnData
      };
    } catch (error) {
      console.error('Error in HSN.create:', error);
      throw error;
    }
  }

  // Update an HSN code
  static async update(hsnId, hsnData) {
    try {
      const { code, description, default_gst_rate_id } = hsnData;
      
      const [result] = await pool.execute(
        'UPDATE hsn_codes SET code = ?, description = ?, default_gst_rate_id = ? WHERE hsn_id = ?',
        [code, description, default_gst_rate_id, hsnId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return {
        hsn_id: hsnId,
        ...hsnData
      };
    } catch (error) {
      console.error('Error in HSN.update:', error);
      throw error;
    }
  }

  // Delete an HSN code
  static async delete(hsnId) {
    try {
      // Check if HSN code is being used by any product
      const [products] = await pool.execute(
        'SELECT COUNT(*) as count FROM products WHERE hsn_code_id = ?',
        [hsnId]
      );
      
      if (products[0].count > 0) {
        throw new Error('Cannot delete HSN code that is used by products');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM hsn_codes WHERE hsn_id = ?',
        [hsnId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in HSN.delete:', error);
      throw error;
    }
  }

  // Associate HSN codes with product categories
  static async associateWithCategory(categoryId, hsnId) {
    try {
      const [result] = await pool.execute(
        'UPDATE categories SET default_hsn_id = ? WHERE category_id = ?',
        [hsnId, categoryId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in HSN.associateWithCategory:', error);
      throw error;
    }
  }

  // Get HSN code for a category
  static async getForCategory(categoryId) {
    try {
      const [rows] = await pool.execute(
        `SELECT h.*, g.rate_name, g.percentage 
         FROM categories c
         JOIN hsn_codes h ON c.default_hsn_id = h.hsn_id
         LEFT JOIN gst_rates g ON h.default_gst_rate_id = g.rate_id
         WHERE c.category_id = ?`,
        [categoryId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in HSN.getForCategory:', error);
      throw error;
    }
  }

  // Import HSN codes from array
  static async bulkImport(hsnCodes) {
    try {
      // Use a transaction to ensure all-or-nothing import
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        const insertPromises = hsnCodes.map(async (hsn) => {
          const [result] = await connection.execute(
            'INSERT INTO hsn_codes (code, description, default_gst_rate_id) VALUES (?, ?, ?)',
            [hsn.code, hsn.description, hsn.default_gst_rate_id]
          );
          return result.insertId;
        });
        
        const insertedIds = await Promise.all(insertPromises);
        await connection.commit();
        
        return {
          success: true,
          count: insertedIds.length,
          ids: insertedIds
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error in HSN.bulkImport:', error);
      throw error;
    }
  }

  // Search HSN codes
  static async search(query, limit = 20, offset = 0) {
    try {
      const searchTerm = `%${query}%`;
      
      const [rows] = await pool.execute(
        `SELECT h.*, g.rate_name, g.percentage 
         FROM hsn_codes h
         LEFT JOIN gst_rates g ON h.default_gst_rate_id = g.rate_id
         WHERE h.code LIKE ? OR h.description LIKE ?
         ORDER BY h.code ASC
         LIMIT ? OFFSET ?`,
        [searchTerm, searchTerm, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('Error in HSN.search:', error);
      throw error;
    }
  }
}

module.exports = HSN; 