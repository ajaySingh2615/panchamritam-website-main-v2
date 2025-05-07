import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, token, user } = useAuth();
  const [lastSync, setLastSync] = useState(null);

  // Load cart - either from API if authenticated or localStorage if not
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated && token) {
          // Fetch cart from API if user is authenticated
          const response = await axios.get(API_ENDPOINTS.CART, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.status === 'success') {
            setCartItems(response.data.data.cart.items || []);
            setLastSync(new Date().toISOString());
          } else {
            throw new Error('Failed to fetch cart');
          }
        } else {
          // Load from localStorage if not authenticated
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (error) {
              console.error("Error parsing cart from localStorage:", error);
              setCartItems([]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        setError('Failed to load your cart. Please try again.');
        
        // Fall back to localStorage if API fails
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
            setCartItems([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, token, user?.user_id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart
  const addToCart = async (product) => {
    try {
      // Ensure we have proper product_id and normalize it to number
      const productId = parseInt(product.product_id || product.id);
      
      if (!productId) {
        console.error("Product has no valid ID:", product);
        setError('Invalid product ID');
        return {
          success: false,
          error: 'Invalid product ID'
        };
      }
      
      // Determine the quantity to add (use cartQuantity first, then quantity if provided, default to 1)
      const quantityToAdd = product.cartQuantity || (typeof product.quantity === 'number' && product.quantity > 0 && product.quantity < 10 ? product.quantity : 1);
      
      if (isAuthenticated && token) {
        setLoading(true);
        setError(null);
        
        try {
          // Call API to add to cart
          const response = await axios.post(API_ENDPOINTS.CART + '/items', {
            productId,
            quantity: quantityToAdd
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.status === 'success') {
            // Refresh the entire cart to ensure consistency
            const cartResponse = await axios.get(API_ENDPOINTS.CART, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (cartResponse.data.status === 'success') {
              setCartItems(cartResponse.data.data.cart.items || []);
              setLastSync(new Date().toISOString());
            }
            
            setLoading(false);
            return {
              success: true,
              message: 'Item added to cart successfully',
              availableStock: response.data.data.availableStock
            };
          }
        } catch (error) {
          setLoading(false);
          
          // Handle inventory validation errors with better logging
          if (error.response?.data?.message) {
            const errorMessage = error.response.data.message;
            console.error("Inventory validation error:", errorMessage);
            setError(errorMessage);
            alert(errorMessage); // Add explicit alert for visibility during testing
            return {
              success: false,
              error: errorMessage
            };
          }
          
          // Handle other errors
          console.error("Unknown cart error:", error);
          const errorMsg = 'Failed to add item to cart';
          setError(errorMsg);
          alert(errorMsg); // Add explicit alert for visibility during testing
          return {
            success: false,
            error: errorMsg
          };
        }
      } else {
        // For non-authenticated users, we need to do client-side inventory validation
        // This is less secure but provides a better UX for guest users
        setError(null);
        
        // Get the available quantity from the product data
        const availableQuantity = parseInt(product.quantity) || 0;
        
        // Find existing item by checking all possible ID formats
        const existingItem = cartItems.find(item => 
          parseInt(item.product_id) === productId || 
          (item.id && parseInt(item.id) === productId)
        );
        
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const totalRequestedQuantity = currentQuantity + quantityToAdd;
        
        // Check if we have enough inventory
        if (availableQuantity < totalRequestedQuantity) {
          const errorMessage = `Insufficient inventory. Only ${availableQuantity} items available, and you already have ${currentQuantity} in your cart.`;
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage
          };
        }
        
        // Client-side validation passed, proceed with adding to cart
        setCartItems(prevItems => {
          if (existingItem) {
            return prevItems.map(item =>
              (parseInt(item.product_id) === productId || (item.id && parseInt(item.id) === productId))
                ? { ...item, quantity: item.quantity + quantityToAdd }
                : item
            );
          }
          
          // Create new item with appropriate quantity
          const newItem = { 
            ...product, 
            product_id: productId,
            id: productId, // Add id field for consistency
            quantity: quantityToAdd
          };
          
          return [...prevItems, newItem];
        });
        
        return {
          success: true,
          message: 'Item added to cart successfully',
          availableStock: availableQuantity - totalRequestedQuantity
        };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMsg = 'Failed to add item to cart';
      setError(errorMsg);
      alert(errorMsg); // Add explicit alert for visibility during testing
      setLoading(false);
      return {
        success: false,
        error: errorMsg
      };
    }
  };

  // Update cart item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      // Normalize productId to number
      const normalizedId = parseInt(productId);
      setError(null);
      
      if (isAuthenticated && token) {
        setLoading(true);
        
        // First, need to find the cart_item_id for the product
        const cartItem = cartItems.find(item => 
          parseInt(item.product_id) === normalizedId || 
          (item.id && parseInt(item.id) === normalizedId)
        );
        
        if (!cartItem || !cartItem.cart_item_id) {
          setLoading(false);
          const errorMsg = 'Cart item not found';
          setError(errorMsg);
          alert(errorMsg); // Add alert for visibility
          return {
            success: false,
            error: errorMsg
          };
        }
        
        try {
          // Call API to update quantity
          const response = await axios.patch(
            `${API_ENDPOINTS.CART}/items/${cartItem.cart_item_id}`, 
            { quantity },
            { headers: { Authorization: `Bearer ${token}` }}
          );
          
          if (response.data.status === 'success') {
            // If item was removed (quantity was 0)
            if (response.data.data.removed) {
              setCartItems(prevItems => 
                prevItems.filter(item => 
                  parseInt(item.product_id) !== normalizedId && 
                  (!item.id || parseInt(item.id) !== normalizedId)
                )
              );
            } else {
              // Item was updated, refresh cart
              const cartResponse = await axios.get(API_ENDPOINTS.CART, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (cartResponse.data.status === 'success') {
                setCartItems(cartResponse.data.data.cart.items || []);
                setLastSync(new Date().toISOString());
              }
            }
            
            setLoading(false);
            return {
              success: true,
              message: 'Cart updated successfully',
              availableStock: response.data.data.availableStock
            };
          }
        } catch (error) {
          setLoading(false);
          
          // Handle inventory validation errors
          if (error.response?.data?.message) {
            const errorMessage = error.response.data.message;
            console.error("Inventory validation error:", errorMessage);
            setError(errorMessage);
            alert(errorMessage); // Add alert for visibility
            return {
              success: false,
              error: errorMessage
            };
          }
          
          // Handle other errors
          console.error("Unknown update error:", error);
          const errorMsg = 'Failed to update cart';
          setError(errorMsg);
          alert(errorMsg); // Add alert for visibility
          return {
            success: false,
            error: errorMsg
          };
        }
      } else {
        // For non-authenticated users, we need to do client-side inventory validation
        // Get the product from cart
        const cartItem = cartItems.find(item => 
          parseInt(item.product_id) === normalizedId || 
          (item.id && parseInt(item.id) === normalizedId)
        );
        
        if (!cartItem) {
          const errorMsg = 'Cart item not found';
          setError(errorMsg);
          alert(errorMsg); // Add alert for visibility
          return {
            success: false,
            error: errorMsg
          };
        }
        
        // If quantity is 0 or negative, remove the item
        if (quantity <= 0) {
          setCartItems(prevItems =>
            prevItems.filter(item => 
              parseInt(item.product_id) !== normalizedId && 
              (!item.id || parseInt(item.id) !== normalizedId)
            )
          );
          
          return {
            success: true,
            message: 'Item removed from cart'
          };
        }
        
        // Check if we have enough inventory
        const availableQuantity = parseInt(cartItem.product_quantity) || parseInt(cartItem.quantity) || 0;
        
        if (availableQuantity < quantity) {
          const errorMessage = `Insufficient inventory. Only ${availableQuantity} items available.`;
          setError(errorMessage);
          alert(errorMessage); // Add alert for visibility
          return {
            success: false,
            error: errorMessage
          };
        }
        
        // Update cart if inventory check passes
        setCartItems(prevItems =>
          prevItems.map(item =>
            parseInt(item.product_id) === normalizedId || (item.id && parseInt(item.id) === normalizedId)
              ? { ...item, quantity }
              : item
          )
        );
        
        return {
          success: true,
          message: 'Cart updated successfully',
          availableStock: availableQuantity - quantity
        };
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      const errorMsg = 'Failed to update cart';
      setError(errorMsg);
      alert(errorMsg); // Add alert for visibility
      setLoading(false);
      return {
        success: false,
        error: errorMsg
      };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      // Normalize productId to number
      const normalizedId = parseInt(productId);
      
      if (isAuthenticated && token) {
        setLoading(true);
        
        // Find the cart_item_id for the product
        const cartItem = cartItems.find(item => 
          parseInt(item.product_id) === normalizedId || 
          (item.id && parseInt(item.id) === normalizedId)
        );
        
        if (!cartItem || !cartItem.cart_item_id) {
          throw new Error('Cart item not found');
        }
        
        // Call API to remove item
        const response = await axios.delete(
          `${API_ENDPOINTS.CART}/items/${cartItem.cart_item_id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (response.data.status === 'success') {
          setCartItems(prevItems =>
            prevItems.filter(item => 
              parseInt(item.product_id) !== normalizedId && 
              (!item.id || parseInt(item.id) !== normalizedId)
            )
          );
        }
        setLoading(false);
      } else {
        // Handle local cart removal
        setCartItems(prevItems =>
          prevItems.filter(item => 
            parseInt(item.product_id) !== normalizedId && 
            (!item.id || parseInt(item.id) !== normalizedId)
          )
        );
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError('Failed to remove item from cart');
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (isAuthenticated && token) {
        setLoading(true);
        
        // Call API to clear cart
        const response = await axios.delete(
          API_ENDPOINTS.CART,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (response.data.status === 'success') {
          setCartItems([]);
        }
        setLoading(false);
      } else {
        // Handle local cart clear
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError('Failed to clear cart');
      setLoading(false);
    }
  };

  // Get cart total price
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return cartItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  };

  const value = {
    cartItems,
    cart: cartItems,
    loading,
    error,
    addToCart,
    updateCartItemQuantity: updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 