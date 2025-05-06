const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT u.user_id, u.name, u.email, u.phone_number, u.created_at, r.role_name ' +
        'FROM Users u JOIN Roles r ON u.role_id = r.role_id'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAllWithRoles() {
    try {
      const [rows] = await pool.execute(
        'SELECT u.user_id, u.name, u.email, u.phone_number, u.created_at, u.profile_picture, ' +
        'u.google_id, u.google_email, u.role_id, r.role_name ' +
        'FROM Users u JOIN Roles r ON u.role_id = r.role_id'
      );
      
      // Set default status for all users
      return rows.map(user => ({
        ...user,
        status: 'active'  // Hard-code status since it's not in the database
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findById(userId) {
    try {
      console.log('User.findById called with ID:', userId, 'type:', typeof userId);
      
      // Ensure userId is a number
      const id = parseInt(userId, 10);
      if (isNaN(id)) {
        console.error('Invalid user ID format:', userId);
        return null;
      }
      
      console.log('Executing SQL query with user_id:', id);
      const [rows] = await pool.execute(
        'SELECT u.user_id, u.name, u.email, u.phone_number, u.profile_picture, u.created_at, ' +
        'u.google_id, u.google_email, u.role_id, r.role_name ' +
        'FROM Users u JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.user_id = ?',
        [id]
      );
      
      console.log('Query result rows:', rows.length);
      
      if (rows.length === 0) {
        return null;
      }
      
      // Set default status if not set
      const user = rows[0];
      console.log('Found user:', user.user_id);
      
      return {
        ...user,
        status: 'active' // Hard-code status since it's not in the database
      };
    } catch (error) {
      console.error('Error in User.findById:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.*, r.role_name FROM Users u ' +
        'JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByPhoneNumber(phoneNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.*, r.role_name FROM Users u ' +
        'JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.phone_number = ?',
        [phoneNumber]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByGoogleId(googleId) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.*, r.role_name FROM Users u ' +
        'JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.google_id = ?',
        [googleId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const { name, email, password, phoneNumber, googleId, googleEmail, profilePicture, roleId } = userData;
    
    try {
      // For non-OAuth users, hash password
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }
      
      const [result] = await pool.execute(
        'INSERT INTO Users (name, email, password, phone_number, google_id, google_email, profile_picture, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phoneNumber || null, googleId || null, googleEmail || null, profilePicture || null, roleId]
      );
      
      return {
        userId: result.insertId,
        name,
        email,
        phoneNumber,
        googleId,
        profilePicture,
        roleId
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, userData) {
    const { name, email, phoneNumber, roleId } = userData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE Users SET name = ?, email = ?, phone_number = ?, role_id = ? WHERE user_id = ?',
        [name, email, phoneNumber, roleId, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return updated user
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  static async delete(userId) {
    try {
      await pool.execute('DELETE FROM Users WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateRole(userId, roleId) {
    try {
      const [result] = await pool.execute(
        'UPDATE Users SET role_id = ? WHERE user_id = ?',
        [roleId, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return updated user
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  static async updateResetToken(userId, token, expires) {
    try {
      const [result] = await pool.execute(
        'UPDATE Users SET password_reset_token = ?, password_reset_expires = ? WHERE user_id = ?',
        [token, expires, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async removeResetToken(userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE Users SET password_reset_token = NULL, password_reset_expires = NULL WHERE user_id = ?',
        [userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(userId, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE Users SET status = ? WHERE user_id = ?',
        [status, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return updated user
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  static async count() {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM Users');
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  static async findRecent(limit = 5) {
    try {
      console.log('User.findRecent called with limit:', limit);
      
      // Ensure limit is a number
      limit = parseInt(limit, 10);
      
      // Check table structure
      const [tableInfo] = await pool.execute('DESCRIBE Users');
      console.log('Users table columns:', tableInfo.map(row => row.Field).join(', '));
      
      // Check if we have created_at column
      const hasCreatedAt = tableInfo.some(row => row.Field === 'created_at');
      const dateColumn = hasCreatedAt ? 'u.created_at' : 'NOW()';
      
      const query = `
        SELECT u.user_id, u.name, u.email, u.phone_number, 
        ${hasCreatedAt ? 'u.created_at,' : ''} u.profile_picture,
        u.google_id, r.role_name 
        FROM Users u JOIN Roles r ON u.role_id = r.role_id 
        ${hasCreatedAt ? `ORDER BY ${dateColumn} DESC` : ''}
        LIMIT ?
      `;
      
      console.log('User.findRecent query:', query);
      
      const [rows] = await pool.execute(query, [limit]);
      console.log(`Found ${rows.length} recent users`);
      
      // Add status to each user
      return rows.map(user => ({
        ...user,
        status: 'active' // Hard-code status since we don't have this column
      }));
    } catch (error) {
      console.error('Error in User.findRecent:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateGoogleInfo(userId, googleInfo) {
    try {
      const { googleId, googleEmail, profilePicture } = googleInfo;
      
      const [result] = await pool.execute(
        'UPDATE Users SET google_id = ?, google_email = ?, profile_picture = ? WHERE user_id = ?',
        [googleId, googleEmail, profilePicture, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return updated user
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  static async safeFindById(userId) {
    try {
      return await this.findById(userId);
    } catch (error) {
      console.error(`Safe user lookup failed for ID ${userId}:`, error);
      return null;
    }
  }
}

module.exports = User; 