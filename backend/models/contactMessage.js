const { pool } = require('../config/db');

class ContactMessage {
  static async findAll(limit = 20, offset = 0) {
    try {
      const numLimit = parseInt(limit);
      const numOffset = parseInt(offset);
      
      const [rows] = await pool.execute(
        `SELECT * FROM Contact_Messages 
         ORDER BY submitted_at DESC 
         LIMIT ${numLimit} OFFSET ${numOffset}`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(messageId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Contact_Messages WHERE message_id = ?',
        [messageId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(messageData) {
    const { name, email, subject, message } = messageData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO Contact_Messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject, message]
      );
      
      return {
        messageId: result.insertId,
        name,
        email,
        subject,
        message,
        submittedAt: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  static async delete(messageId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Contact_Messages WHERE message_id = ?',
        [messageId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ContactMessage; 