const { pool } = require('../config/db');

class Review {
  static async findByProductId(productId, limit = 20, offset = 0) {
    try {
      // Ensure parameters are valid
      const prodId = parseInt(productId, 10);
      if (isNaN(prodId)) {
        return [];
      }

      // Ensure limit and offset are integers
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);
      
      try {
        // First try query without status filtering (for after migration)
        const [rows] = await pool.execute(
          `SELECT r.*, u.name as user_name, u.profile_picture as user_profile_picture
           FROM reviews r
           LEFT JOIN users u ON r.user_id = u.user_id
           WHERE r.product_id = ?
           ORDER BY r.created_at DESC
           LIMIT ${limit} OFFSET ${offset}`,
          [prodId]
        );
        
        return rows;
      } catch (queryError) {
        // If error occurs (likely due to missing status column), try the old query with status
        console.error('First query failed, trying fallback query:', queryError);
        
        try {
          const [fallbackRows] = await pool.execute(
            `SELECT r.*, u.name as user_name, u.profile_picture as user_profile_picture
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.user_id
             WHERE r.product_id = ? AND r.status = 'approved'
             ORDER BY r.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            [prodId]
          );
          
          return fallbackRows;
        } catch (fallbackError) {
          // If the fallback fails too, try a minimal query to get any reviews
          console.error('Fallback query failed, trying minimal query:', fallbackError);
          
          const [minimalRows] = await pool.execute(
            `SELECT r.* FROM reviews r WHERE r.product_id = ? LIMIT ${limit} OFFSET ${offset}`,
            [prodId]
          );
          
          return minimalRows;
        }
      }
    } catch (error) {
      console.error('Error in Review.findByProductId:', error);
      // Return empty array to prevent UI errors
      return [];
    }
  }

  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      // Get reviews from a specific user with product information
      const [rows] = await pool.execute(
        `SELECT r.*, p.name as product_name, p.image_url as product_image
         FROM reviews r
         LEFT JOIN products p ON r.product_id = p.product_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('Error in Review.findByUserId:', error);
      throw error;
    }
  }

  static async findById(reviewId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.name as user_name, p.name as product_name
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.user_id
         LEFT JOIN products p ON r.product_id = p.product_id
         WHERE r.review_id = ?`,
        [reviewId]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Review.findById:', error);
      throw error;
    }
  }

  static async checkUserReview(userId, productId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Review.checkUserReview:', error);
      throw error;
    }
  }

  static async create(reviewData) {
    const { productId, userId, rating, title, content } = reviewData;
    
    try {
      console.log('Creating review with data:', {
        product_id: productId,
        user_id: userId,
        rating,
        title,
        content
      });
      
      // Ensure all values are properly formatted
      const parsedProductId = parseInt(productId, 10);
      const parsedUserId = parseInt(userId, 10);
      const parsedRating = parseFloat(rating);
      
      if (isNaN(parsedProductId) || isNaN(parsedUserId) || isNaN(parsedRating)) {
        console.error('Invalid review data:', {
          productId, parsedProductId,
          userId, parsedUserId,
          rating, parsedRating
        });
        throw new Error('Invalid review data. Product ID, User ID, and Rating must be valid numbers.');
      }
      
      // Try to insert the review with the standard column names first
      try {
        const [result] = await pool.execute(
          `INSERT INTO reviews (product_id, user_id, rating, title, content, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [parsedProductId, parsedUserId, parsedRating, title, content]
        );
        
        console.log('Review created successfully, ID:', result.insertId);
        
        return {
          review_id: result.insertId,
          product_id: parsedProductId,
          user_id: parsedUserId,
          rating: parsedRating,
          title,
          content,
          created_at: new Date().toISOString()
        };
      } catch (firstError) {
        // Log the first error
        console.error('First attempt failed, trying alternative:', firstError.message);
        
        // If that fails, try with potentially different column names or formats
        try {
          // Try another format (maybe different casing or column order)
          const [fallbackResult] = await pool.execute(
            `INSERT INTO Reviews (product_id, user_id, rating, title, content, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [parsedProductId, parsedUserId, parsedRating, title || '', content || '']
          );
          
          console.log('Review created with alternative query, ID:', fallbackResult.insertId);
          
          return {
            review_id: fallbackResult.insertId,
            product_id: parsedProductId,
            user_id: parsedUserId,
            rating: parsedRating,
            title: title || '',
            content: content || '',
            created_at: new Date().toISOString()
          };
        } catch (secondError) {
          console.error('Second attempt failed:', secondError.message);
          
          // Try a minimal column set as a last resort
          const [minimalResult] = await pool.execute(
            `INSERT INTO reviews (product_id, user_id, rating)
             VALUES (?, ?, ?)`,
            [parsedProductId, parsedUserId, parsedRating]
          );
          
          console.log('Review created with minimal query, ID:', minimalResult.insertId);
          
          return {
            review_id: minimalResult.insertId,
            product_id: parsedProductId,
            user_id: parsedUserId,
            rating: parsedRating,
            title: title || '',
            content: content || '',
            created_at: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.error('Error in Review.create:', error);
      throw error;
    }
  }

  static async update(reviewId, reviewData) {
    try {
      const { rating, title, content } = reviewData;
      
      // Update the review without status field
      const [result] = await pool.execute(
        `UPDATE reviews
         SET rating = ?, title = ?, content = ?
         WHERE review_id = ?`,
        [rating, title, content, reviewId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Review.update:', error);
      throw error;
    }
  }

  static async delete(reviewId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM reviews WHERE review_id = ?',
        [reviewId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Review.delete:', error);
      throw error;
    }
  }

  static async getProductStats(productId) {
    try {
      // First try query without status filtering (for after migration)
      try {
        const [rows] = await pool.execute(
          `SELECT 
             COUNT(*) as total_reviews,
             AVG(rating) as average_rating,
             COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
             COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
             COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
             COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
             COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
           FROM reviews
           WHERE product_id = ?`,
          [productId]
        );
        
        // Ensure average_rating is always a number
        const stats = {
          ...rows[0],
          average_rating: rows[0].average_rating ? parseFloat(rows[0].average_rating) : 0
        };
        
        return stats;
      } catch (queryError) {
        // If error occurs, try the old query with status filtering
        console.error('Stats query failed, trying fallback:', queryError);
        
        const [fallbackRows] = await pool.execute(
          `SELECT 
             COUNT(*) as total_reviews,
             AVG(rating) as average_rating,
             COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
             COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
             COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
             COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
             COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
           FROM reviews
           WHERE product_id = ? AND status = 'approved'`,
          [productId]
        );
        
        // Ensure average_rating is always a number
        const stats = {
          ...fallbackRows[0],
          average_rating: fallbackRows[0].average_rating ? parseFloat(fallbackRows[0].average_rating) : 0
        };
        
        return stats;
      }
    } catch (error) {
      console.error('Error in Review.getProductStats:', error);
      // Return empty stats object instead of throwing
      return {
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      };
    }
  }
}

module.exports = Review;