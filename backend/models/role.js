const { pool } = require('../config/db');

class Role {
  static async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM Roles');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(roleId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM Roles WHERE role_id = ?', [roleId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByName(roleName) {
    try {
      const [rows] = await pool.execute('SELECT * FROM Roles WHERE role_name = ?', [roleName]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(roleName) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO Roles (role_name) VALUES (?)',
        [roleName]
      );
      return { roleId: result.insertId, roleName };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Role; 