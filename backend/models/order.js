const { pool } = require('../config/db');
const Cart = require('./cart');

class Order {
  // Get all orders (admin only)
  static async findAll(limit = 20, offset = 0) {
    try {
      // Ensure limit and offset are integers
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);
      
      const [orders] = await pool.execute(
        `SELECT o.*, u.name as user_name, u.email as user_email,
                a.address_line, a.city, a.state, a.zip_code, a.country, a.phone_number
         FROM Orders o
         JOIN Users u ON o.user_id = u.user_id
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         ORDER BY o.order_date DESC
         LIMIT ${limit} OFFSET ${offset}`
      );
      
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // Find recent orders with user info (for admin dashboard)
  static async findRecent(limit = 5) {
    try {
      console.log('Order.findRecent called with limit:', limit);
      
      // Ensure limit is a number
      limit = parseInt(limit, 10);
      
      // Get table structure to verify columns exist
      const [tableInfo] = await pool.execute('DESCRIBE Orders');
      console.log('Orders table columns:', tableInfo.map(row => row.Field).join(', '));
      
      const [userTableInfo] = await pool.execute('DESCRIBE Users');
      console.log('Users table columns:', userTableInfo.map(row => row.Field).join(', '));
      
      // Check if we have the columns we need
      const hasCreatedAt = tableInfo.some(row => row.Field === 'created_at');
      const hasOrderDate = tableInfo.some(row => row.Field === 'order_date');
      
      // Use appropriate date column
      const dateColumn = hasCreatedAt ? 'o.created_at' : hasOrderDate ? 'o.order_date' : 'NOW()';
      
      const query = `
        SELECT o.order_id, o.user_id, o.total_price as total_amount, o.status, 
        ${dateColumn} as order_date, u.name as customer_name
        FROM Orders o
        JOIN Users u ON o.user_id = u.user_id
        ORDER BY ${dateColumn} DESC
        LIMIT ?
      `;
      
      console.log('Order.findRecent query:', query);
      
      const [orders] = await pool.execute(query, [limit]);
      console.log(`Found ${orders.length} recent orders`);
      
      return orders;
    } catch (error) {
      console.error('Error in Order.findRecent:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }
  
  // Count total orders
  static async count() {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM Orders');
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
  
  // Sum completed orders amount
  static async sumCompletedAmount() {
    try {
      const [rows] = await pool.execute(
        'SELECT SUM(total_price) as total FROM Orders WHERE status = "completed"'
      );
      return rows[0].total || 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Get order by ID
  static async findById(orderId) {
    try {
      // Get order details
      const [orders] = await pool.execute(
        `SELECT o.*, u.name as user_name, u.email as user_email,
                a.address_line, a.city, a.state, a.zip_code, a.country, a.phone_number
         FROM Orders o
         JOIN Users u ON o.user_id = u.user_id
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         WHERE o.order_id = ?`,
        [orderId]
      );
      
      if (orders.length === 0) {
        return null;
      }
      
      const order = orders[0];
      
      // Get order items
      const [items] = await pool.execute(
        `SELECT oi.*, p.name, p.image_url, c.name as category_name
         FROM Order_Items oi
         JOIN Products p ON oi.product_id = p.product_id
         LEFT JOIN Categories c ON p.category_id = c.category_id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      return {
        ...order,
        items
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get orders by user ID
  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      // Ensure limit and offset are integers
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);
      
      const [orders] = await pool.execute(
        `SELECT o.*, a.address_line, a.city, a.state, a.zip_code, a.country, a.phone_number
         FROM Orders o
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         WHERE o.user_id = ?
         ORDER BY o.order_date DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [userId]
      );
      
      // Get items for each order
      for (let order of orders) {
        const [items] = await pool.execute(
          `SELECT oi.*, p.name, p.image_url, c.name as category_name
           FROM Order_Items oi
           JOIN Products p ON oi.product_id = p.product_id
           LEFT JOIN Categories c ON p.category_id = c.category_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );
        
        order.items = items;
      }
      
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // Create new order from cart
  static async createFromCart(userId, addressId, paymentMethod = 'Cash on Delivery') {
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        // Get user's cart with items
        const cart = await Cart.findByUserId(userId);
        
        if (cart.items.length === 0) {
          throw new Error('Cart is empty');
        }
        
        // Calculate total price
        const totalPrice = parseFloat(cart.subtotal);
        
        // Create order
        const [orderResult] = await connection.execute(
          `INSERT INTO Orders 
           (user_id, address_id, total_price, status, payment_method) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, addressId, totalPrice, 'pending', paymentMethod]
        );
        
        const orderId = orderResult.insertId;
        
        // Create order items
        for (const item of cart.items) {
          await connection.execute(
            `INSERT INTO Order_Items 
             (order_id, product_id, quantity, price) 
             VALUES (?, ?, ?, ?)`,
            [orderId, item.product_id, item.quantity, item.price]
          );
          
          // Update product inventory
          await connection.execute(
            `UPDATE Products 
             SET quantity = quantity - ? 
             WHERE product_id = ?`,
            [item.quantity, item.product_id]
          );
        }
        
        // Clear cart
        await Cart.clearCart(userId);
        
        // Commit transaction
        await connection.commit();
        
        // Return order details
        return {
          orderId,
          userId,
          addressId,
          totalPrice,
          status: 'pending',
          paymentMethod,
          items: cart.items.map(item => ({
            productId: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.total_price
          }))
        };
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
      } finally {
        // Release connection
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Update order status
  static async updateStatus(orderId, status) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const [result] = await pool.execute(
        'UPDATE Orders SET status = ? WHERE order_id = ?',
        [status, orderId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return this.findById(orderId);
    } catch (error) {
      throw error;
    }
  }
  
  // Cancel order
  static async cancelOrder(orderId) {
    return this.updateStatus(orderId, 'cancelled');
  }
  
  // Get items for a specific order
  static async getOrderItems(orderId) {
    try {
      const [items] = await pool.execute(
        `SELECT oi.*, p.name, p.price, p.image_url
         FROM Order_Items oi
         JOIN Products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      return items;
    } catch (error) {
      console.error('Error in Order.getOrderItems:', error);
      throw error;
    }
  }
  
  // Calculate taxes for cart items before order creation
  static async calculateCartTaxes(cartItems) {
    try {
      const Product = require('./product');
      
      let subtotal = 0;
      let totalTax = 0;
      
      // Process each cart item to calculate tax
      const itemsWithTax = await Promise.all(cartItems.map(async (item) => {
        try {
          // Get product tax information
          const taxInfo = await Product.getTaxInfo(item.product_id);
          
          if (!taxInfo) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }
          
          // Calculate item totals
          const itemSubtotal = parseFloat(item.price) * item.quantity;
          const itemTaxRate = taxInfo.gst_rate ? parseFloat(taxInfo.gst_rate.percentage) : 0;
          const itemTaxAmount = (itemSubtotal * itemTaxRate) / 100;
          
          // Add to running totals
          subtotal += itemSubtotal;
          totalTax += itemTaxAmount;
          
          // Return item with tax information
          return {
            ...item,
            tax_rate: itemTaxRate,
            tax_amount: itemTaxAmount,
            hsn_code: taxInfo.hsn_code || null,
            total_price: itemSubtotal + itemTaxAmount
          };
        } catch (error) {
          console.error(`Error calculating tax for product ${item.product_id}:`, error);
          // Return item without tax information as fallback
          return {
            ...item,
            tax_rate: 0,
            tax_amount: 0,
            hsn_code: null,
            total_price: parseFloat(item.price) * item.quantity
          };
        }
      }));
      
      return {
        items: itemsWithTax,
        subtotal,
        total_tax: totalTax,
        total: subtotal + totalTax
      };
    } catch (error) {
      console.error('Error in Order.calculateCartTaxes:', error);
      throw error;
    }
  }
  
  // Enhanced createOrder method with tax calculations
  static async createOrderWithTax(orderData, cartItems) {
    try {
      // Calculate taxes for cart items
      const taxCalculation = await this.calculateCartTaxes(cartItems);
      
      // Begin transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Create order with tax information
        const [orderResult] = await connection.execute(
          `INSERT INTO Orders (
            user_id, address_id, subtotal, total_tax, total_price, 
            status, payment_method
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderData.user_id,
            orderData.address_id,
            taxCalculation.subtotal,
            taxCalculation.total_tax,
            taxCalculation.total,
            orderData.status || 'pending',
            orderData.payment_method || 'Cash on Delivery'
          ]
        );
        
        const orderId = orderResult.insertId;
        
        // Insert order items with tax information
        for (const item of taxCalculation.items) {
          await connection.execute(
            `INSERT INTO Order_Items (
              order_id, product_id, quantity, price, 
              tax_rate, tax_amount, hsn_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              item.product_id,
              item.quantity,
              item.price,
              item.tax_rate,
              item.tax_amount,
              item.hsn_code
            ]
          );
        }
        
        await connection.commit();
        
        // Get the created order
        const order = await this.findById(orderId);
        
        return order;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error in Order.createOrderWithTax:', error);
      throw error;
    }
  }
  
  // Generate tax invoice data for an order
  static async generateTaxInvoice(orderId) {
    try {
      // Get order details
      const order = await this.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Get order items with tax details
      const [items] = await pool.execute(
        `SELECT oi.*, p.name, p.sku, p.image_url
         FROM Order_Items oi
         JOIN Products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      // Group items by tax rate for tax summary
      const taxSummary = items.reduce((summary, item) => {
        const taxRate = parseFloat(item.tax_rate);
        if (!summary[taxRate]) {
          summary[taxRate] = {
            rate: taxRate,
            taxable_amount: 0,
            tax_amount: 0
          };
        }
        
        const itemPrice = parseFloat(item.price) * item.quantity;
        summary[taxRate].taxable_amount += itemPrice;
        summary[taxRate].tax_amount += parseFloat(item.tax_amount);
        
        return summary;
      }, {});
      
      // Convert tax summary to array
      const taxBreakdown = Object.values(taxSummary);
      
      // Get customer and address details
      const [userRows] = await pool.execute(
        'SELECT * FROM Users WHERE user_id = ?',
        [order.user_id]
      );
      
      const [addressRows] = await pool.execute(
        'SELECT * FROM Addresses WHERE address_id = ?',
        [order.address_id]
      );
      
      const customer = userRows.length > 0 ? userRows[0] : null;
      const address = addressRows.length > 0 ? addressRows[0] : null;
      
      return {
        invoice: {
          order_id: orderId,
          invoice_number: `INV-${orderId}`,
          invoice_date: order.created_at || order.order_date || new Date(),
          order_date: order.order_date || order.created_at || new Date(),
          status: order.status
        },
        customer: {
          id: customer?.user_id,
          name: customer?.name,
          email: customer?.email,
          phone: customer?.phone
        },
        shipping_address: address ? {
          name: address.name,
          address_line: address.address_line,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
          phone_number: address.phone_number
        } : null,
        items: items.map(item => ({
          product_id: item.product_id,
          name: item.name,
          sku: item.sku,
          hsn_code: item.hsn_code,
          quantity: item.quantity,
          price: parseFloat(item.price),
          subtotal: parseFloat(item.price) * item.quantity,
          tax_rate: parseFloat(item.tax_rate),
          tax_amount: parseFloat(item.tax_amount),
          total: (parseFloat(item.price) * item.quantity) + parseFloat(item.tax_amount)
        })),
        summary: {
          subtotal: parseFloat(order.subtotal),
          tax_breakdown: taxBreakdown,
          total_tax: parseFloat(order.total_tax),
          total: parseFloat(order.total_price)
        },
        payment: {
          method: order.payment_method || 'Cash on Delivery',
          status: order.payment_status || 'pending'
        }
      };
    } catch (error) {
      console.error('Error in Order.generateTaxInvoice:', error);
      throw error;
    }
  }
}

module.exports = Order; 