const { pool } = require('../config/db');

class Address {
  // Get all addresses for a user
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Addresses WHERE user_id = ? ORDER BY is_default DESC, address_id DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // Get default address for a user
  static async findDefaultByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Addresses WHERE user_id = ? AND is_default = true LIMIT 1',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get address by ID
  static async findById(addressId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Addresses WHERE address_id = ?',
        [addressId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Create new address
  static async create(addressData) {
    const { 
      userId, 
      name, 
      addressLine, 
      city, 
      state, 
      zipCode, 
      country, 
      phoneNumber, 
      addressType = 'Home',
      isDefault = false 
    } = addressData;
    
    try {
      // If this address is set as default, unset any existing default address
      if (isDefault) {
        await pool.execute(
          'UPDATE Addresses SET is_default = false WHERE user_id = ?',
          [userId]
        );
      }
      
      const [result] = await pool.execute(
        `INSERT INTO Addresses 
        (user_id, name, address_line, city, state, zip_code, country, phone_number, address_type, is_default) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, addressLine, city, state, zipCode, country, phoneNumber, addressType, isDefault]
      );
      
      return {
        addressId: result.insertId,
        userId,
        name,
        addressLine,
        city,
        state,
        zipCode,
        country,
        phoneNumber,
        addressType,
        isDefault
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Update address
  static async update(addressId, addressData) {
    const { 
      name,
      addressLine, 
      city, 
      state, 
      zipCode, 
      country, 
      phoneNumber,
      addressType,
      isDefault 
    } = addressData;
    
    const userId = addressData.userId;
    
    try {
      // If this address is set as default, unset any existing default address
      if (isDefault) {
        await pool.execute(
          'UPDATE Addresses SET is_default = false WHERE user_id = ?',
          [userId]
        );
      }
      
      // Update the address
      const [result] = await pool.execute(
        `UPDATE Addresses 
         SET name = ?, address_line = ?, city = ?, state = ?, zip_code = ?, 
         country = ?, phone_number = ?, address_type = ?, is_default = ? 
         WHERE address_id = ?`,
        [name, addressLine, city, state, zipCode, country, phoneNumber, addressType, isDefault, addressId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return {
        addressId,
        ...addressData
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Delete address
  static async delete(addressId) {
    try {
      // Check if address is used in any orders
      const [orders] = await pool.execute(
        'SELECT COUNT(*) as count FROM Orders WHERE address_id = ?',
        [addressId]
      );
      
      if (orders[0].count > 0) {
        throw new Error('Cannot delete address that is used in orders');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM Addresses WHERE address_id = ?',
        [addressId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Address; 