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
        return;
      }
      
      // Determine the quantity to add (use cartQuantity first, then quantity if provided, default to 1)
      const quantityToAdd = product.cartQuantity || (typeof product.quantity === 'number' && product.quantity > 0 && product.quantity < 10 ? product.quantity : 1);
      
      if (isAuthenticated && token) {
        setLoading(true);
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
        }
        setLoading(false);
      } else {
        // Handle adding to local cart if not authenticated
        setCartItems(prevItems => {
          // Find existing item by checking all possible ID formats
          const existingItem = prevItems.find(item => 
            parseInt(item.product_id) === productId || 
            (item.id && parseInt(item.id) === productId)
          );
          
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
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError('Failed to add item to cart');
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      // Normalize productId to number
      const normalizedId = parseInt(productId);
      
      if (isAuthenticated && token) {
        setLoading(true);
        
        // First, need to find the cart_item_id for the product
        const cartItem = cartItems.find(item => 
          parseInt(item.product_id) === normalizedId || 
          (item.id && parseInt(item.id) === normalizedId)
        );
        
        if (!cartItem || !cartItem.cart_item_id) {
          throw new Error('Cart item not found');
        }
        
        // Call API to update quantity
        const response = await axios.patch(
          `${API_ENDPOINTS.CART}/items/${cartItem.cart_item_id}`, 
          { quantity },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (response.data.status === 'success') {
          // If item was removed (quantity was 0)
          if (response.data.message.includes('removed')) {
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
        }
        setLoading(false);
      } else {
        // Handle local cart update
        if (quantity <= 0) {
          setCartItems(prevItems =>
            prevItems.filter(item => 
              parseInt(item.product_id) !== normalizedId && 
              (!item.id || parseInt(item.id) !== normalizedId)
            )
          );
        } else {
          setCartItems(prevItems =>
            prevItems.map(item =>
              parseInt(item.product_id) === normalizedId || (item.id && parseInt(item.id) === normalizedId)
                ? { ...item, quantity }
                : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setError('Failed to update cart');
      setLoading(false);
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