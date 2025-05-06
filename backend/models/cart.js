const { pool } = require('../config/db');

class Cart {
  // Get user's cart with items
  static async findByUserId(userId) {
    try {
      // First, check if user has a cart
      let [carts] = await pool.execute(
        'SELECT * FROM Cart WHERE user_id = ?',
        [userId]
      );
      
      let cartId;
      
      // If cart doesn't exist, create one
      if (carts.length === 0) {
        const [result] = await pool.execute(
          'INSERT INTO Cart (user_id) VALUES (?)',
          [userId]
        );
        cartId = result.insertId;
      } else {
        cartId = carts[0].cart_id;
      }
      
      // Get cart items with product details
      const [items] = await pool.execute(
        `SELECT ci.*, p.name, p.price, p.image_url, c.name as category_name,
                (p.price * ci.quantity) as total_price
         FROM Cart_Items ci
         JOIN Products p ON ci.product_id = p.product_id
         LEFT JOIN Categories c ON p.category_id = c.category_id
         WHERE ci.cart_id = ?`,
        [cartId]
      );
      
      // Calculate cart totals
      let totalItems = 0;
      let subtotal = 0;
      
      items.forEach(item => {
        totalItems += item.quantity;
        subtotal += parseFloat(item.total_price);
      });
      
      return {
        cartId,
        userId,
        items,
        totalItems,
        subtotal: subtotal.toFixed(2)
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Add item to cart
  static async addItem(userId, productId, quantity) {
    try {
      // First, get or create user's cart
      let [carts] = await pool.execute(
        'SELECT * FROM Cart WHERE user_id = ?',
        [userId]
      );
      
      let cartId;
      
      if (carts.length === 0) {
        const [result] = await pool.execute(
          'INSERT INTO Cart (user_id) VALUES (?)',
          [userId]
        );
        cartId = result.insertId;
      } else {
        cartId = carts[0].cart_id;
      }
      
      // Check if product already in cart
      const [existingItems] = await pool.execute(
        'SELECT * FROM Cart_Items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId]
      );
      
      if (existingItems.length > 0) {
        // Update quantity if already in cart
        const newQuantity = existingItems[0].quantity + quantity;
        
        await pool.execute(
          'UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?',
          [newQuantity, existingItems[0].cart_item_id]
        );
        
        return {
          cartItemId: existingItems[0].cart_item_id,
          quantity: newQuantity
        };
      } else {
        // Add new item to cart
        const [result] = await pool.execute(
          'INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
          [cartId, productId, quantity]
        );
        
        return {
          cartItemId: result.insertId,
          quantity
        };
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Update item quantity
  static async updateItemQuantity(userId, cartItemId, quantity) {
    try {
      // Verify cart belongs to user
      const [carts] = await pool.execute(
        'SELECT c.* FROM Cart c JOIN Cart_Items ci ON c.cart_id = ci.cart_id WHERE ci.cart_item_id = ? AND c.user_id = ?',
        [cartItemId, userId]
      );
      
      if (carts.length === 0) {
        throw new Error('Cart item not found or does not belong to user');
      }
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove item
        await pool.execute(
          'DELETE FROM Cart_Items WHERE cart_item_id = ?',
          [cartItemId]
        );
        
        return { removed: true };
      } else {
        // Update quantity
        await pool.execute(
          'UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?',
          [quantity, cartItemId]
        );
        
        return { cartItemId, quantity };
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Remove item from cart
  static async removeItem(userId, cartItemId) {
    try {
      // Verify cart belongs to user
      const [carts] = await pool.execute(
        'SELECT c.* FROM Cart c JOIN Cart_Items ci ON c.cart_id = ci.cart_id WHERE ci.cart_item_id = ? AND c.user_id = ?',
        [cartItemId, userId]
      );
      
      if (carts.length === 0) {
        throw new Error('Cart item not found or does not belong to user');
      }
      
      // Remove item
      await pool.execute(
        'DELETE FROM Cart_Items WHERE cart_item_id = ?',
        [cartItemId]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Clear cart
  static async clearCart(userId) {
    try {
      const [carts] = await pool.execute(
        'SELECT * FROM Cart WHERE user_id = ?',
        [userId]
      );
      
      if (carts.length === 0) {
        return true; // Cart already empty
      }
      
      // Remove all items from cart
      await pool.execute(
        'DELETE FROM Cart_Items WHERE cart_id = ?',
        [carts[0].cart_id]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cart; 