const { pool } = require('../config/db');

class Blog {
  static async findAll(limit = 10, offset = 0) {
    try {
      // Ensure limit and offset are numbers and use them directly in the query
      const numLimit = parseInt(limit);
      const numOffset = parseInt(offset);
      
      const [rows] = await pool.execute(
        `SELECT b.blog_id, b.title, b.content, b.created_at, 
         u.name as author_name 
         FROM Blogs b 
         JOIN Users u ON b.author_id = u.user_id 
         ORDER BY b.created_at DESC 
         LIMIT ${numLimit} OFFSET ${numOffset}`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(blogId) {
    try {
      const [rows] = await pool.execute(
        'SELECT b.blog_id, b.title, b.content, b.created_at, ' +
        'u.name as author_name ' +
        'FROM Blogs b ' +
        'JOIN Users u ON b.author_id = u.user_id ' +
        'WHERE b.blog_id = ?',
        [blogId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(blogData) {
    const { title, content, authorId } = blogData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO Blogs (title, content, author_id) VALUES (?, ?, ?)',
        [title, content, authorId]
      );
      
      return {
        blogId: result.insertId,
        title,
        content,
        authorId,
        createdAt: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(blogId, updateData) {
    const { title, content } = updateData;
    
    try {
      // Create update query dynamically based on provided fields
      let query = 'UPDATE Blogs SET ';
      const queryParams = [];
      
      if (title !== undefined) {
        query += 'title = ?, ';
        queryParams.push(title);
      }
      
      if (content !== undefined) {
        query += 'content = ?, ';
        queryParams.push(content);
      }
      
      // Remove trailing comma and space
      query = query.slice(0, -2);
      
      // Add WHERE clause
      query += ' WHERE blog_id = ?';
      queryParams.push(blogId);
      
      const [result] = await pool.execute(query, queryParams);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return this.findById(blogId);
    } catch (error) {
      throw error;
    }
  }

  static async delete(blogId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Blogs WHERE blog_id = ?',
        [blogId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Blog; 