const { pool } = require('../config/db');

class GST {
  // Get all GST rates
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM GST_Rates ORDER BY percentage ASC'
      );
      return rows;
    } catch (error) {
      console.error('Error in GST.findAll:', error);
      throw error;
    }
  }

  // Get a GST rate by ID
  static async findById(rateId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM GST_Rates WHERE rate_id = ?',
        [rateId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in GST.findById:', error);
      throw error;
    }
  }

  // Get GST rate by name
  static async findByName(rateName) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM GST_Rates WHERE rate_name = ?',
        [rateName]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in GST.findByName:', error);
      throw error;
    }
  }

  // Create a new GST rate
  static async create(rateData) {
    try {
      const { rate_name, percentage, description } = rateData;
      
      const [result] = await pool.execute(
        'INSERT INTO GST_Rates (rate_name, percentage, description) VALUES (?, ?, ?)',
        [rate_name, percentage, description]
      );
      
      return {
        rate_id: result.insertId,
        ...rateData
      };
    } catch (error) {
      console.error('Error in GST.create:', error);
      throw error;
    }
  }

  // Update a GST rate
  static async update(rateId, rateData) {
    try {
      const { rate_name, percentage, description } = rateData;
      
      const [result] = await pool.execute(
        'UPDATE GST_Rates SET rate_name = ?, percentage = ?, description = ? WHERE rate_id = ?',
        [rate_name, percentage, description, rateId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return {
        rate_id: rateId,
        ...rateData
      };
    } catch (error) {
      console.error('Error in GST.update:', error);
      throw error;
    }
  }

  // Delete a GST rate
  static async delete(rateId) {
    try {
      // Check if rate is being used by any HSN code
      const [hsnCodes] = await pool.execute(
        'SELECT COUNT(*) as count FROM HSN_Codes WHERE default_gst_rate_id = ?',
        [rateId]
      );
      
      if (hsnCodes[0].count > 0) {
        throw new Error('Cannot delete GST rate that is used by HSN codes');
      }
      
      // Check if rate is being used by any product
      const [products] = await pool.execute(
        'SELECT COUNT(*) as count FROM Products WHERE custom_gst_rate_id = ?',
        [rateId]
      );
      
      if (products[0].count > 0) {
        throw new Error('Cannot delete GST rate that is used by products');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM GST_Rates WHERE rate_id = ?',
        [rateId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in GST.delete:', error);
      throw error;
    }
  }

  // Determine appropriate GST rate for a product
  static async determineRateForProduct(product) {
    try {
      // 1. Check if product has custom GST rate
      if (product.custom_gst_rate_id) {
        const customRate = await this.findById(product.custom_gst_rate_id);
        if (customRate) return customRate;
      }
      
      // 2. Check HSN code default rate
      if (product.hsn_code_id) {
        const [hsnRows] = await pool.execute(
          'SELECT * FROM HSN_Codes WHERE hsn_id = ?',
          [product.hsn_code_id]
        );
        
        if (hsnRows.length > 0 && hsnRows[0].default_gst_rate_id) {
          const rateFromHsn = await this.findById(hsnRows[0].default_gst_rate_id);
          if (rateFromHsn) return rateFromHsn;
        }
      }
      
      // 3. Apply rules based on branding and packaging
      let rateName = 'Default';
      
      if (product.is_branded && product.is_packaged) {
        rateName = 'Branded_Packaged';
      } else if (product.is_branded) {
        rateName = 'Branded_Only';
      } else if (product.is_packaged) {
        rateName = 'Packaged_Only';
      }
      
      // Get rate by name
      const rate = await this.findByName(rateName);
      
      // Fallback to default rate if specific rate not found
      if (!rate) {
        return await this.findByName('Default') || { rate_id: 0, rate_name: 'None', percentage: 0 };
      }
      
      return rate;
    } catch (error) {
      console.error('Error in GST.determineRateForProduct:', error);
      throw error;
    }
  }
}

module.exports = GST; 