const { pool } = require('../config/db');

class Wishlist {
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT w.wishlist_id, w.user_id, w.product_id, w.added_at, ' +
        'p.name as product_name, p.price, p.image_url, p.description ' +
        'FROM Wishlist w ' +
        'JOIN Products p ON w.product_id = p.product_id ' +
        'WHERE w.user_id = ?',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findItem(userId, productId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async addItem(userId, productId) {
    try {
      // Check if item already exists in wishlist
      const existingItem = await this.findItem(userId, productId);
      if (existingItem) {
        return { message: 'Item already in wishlist' };
      }

      const [result] = await pool.execute(
        'INSERT INTO Wishlist (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      
      return {
        wishlistId: result.insertId,
        userId,
        productId,
        message: 'Item added to wishlist'
      };
    } catch (error) {
      throw error;
    }
  }

  static async removeItem(userId, productId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (result.affectedRows === 0) {
        return { message: 'Item not found in wishlist' };
      }
      
      return { message: 'Item removed from wishlist' };
    } catch (error) {
      throw error;
    }
  }

  static async clearWishlist(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Wishlist WHERE user_id = ?',
        [userId]
      );
      
      return { 
        message: 'Wishlist cleared', 
        itemsRemoved: result.affectedRows 
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Wishlist; 