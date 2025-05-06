const { pool } = require('../config/db');

class Category {
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, COUNT(p.product_id) as product_count 
         FROM Categories c
         LEFT JOIN Products p ON c.category_id = p.category_id
         GROUP BY c.category_id
         ORDER BY c.name`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(categoryId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Categories WHERE category_id = ?',
        [categoryId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(name) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO Categories (name) VALUES (?)',
        [name]
      );
      return { categoryId: result.insertId, name };
    } catch (error) {
      throw error;
    }
  }

  static async update(categoryId, name) {
    try {
      const [result] = await pool.execute(
        'UPDATE Categories SET name = ? WHERE category_id = ?',
        [name, categoryId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { categoryId, name };
    } catch (error) {
      throw error;
    }
  }

  static async delete(categoryId) {
    try {
      // Check if category has products
      const [products] = await pool.execute(
        'SELECT COUNT(*) as count FROM Products WHERE category_id = ?',
        [categoryId]
      );
      
      if (products[0].count > 0) {
        throw new Error('Cannot delete category that has products');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM Categories WHERE category_id = ?',
        [categoryId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category; 