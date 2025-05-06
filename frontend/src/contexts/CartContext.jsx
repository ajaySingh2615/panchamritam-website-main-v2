import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      console.log("Adding to cart:", product);
      console.log("Current cart:", prevItems);
      
      // Ensure we have proper product_id and normalize it to number
      const productId = parseInt(product.product_id || product.id);
      
      if (!productId) {
        console.error("Product has no valid ID:", product);
        return prevItems;
      }
      
      // Determine the quantity to add (use cartQuantity first, then quantity if provided, default to 1)
      // This separates the "quantity to add to cart" from the "stock quantity"
      const quantityToAdd = product.cartQuantity || (typeof product.quantity === 'number' && product.quantity > 0 && product.quantity < 10 ? product.quantity : 1);
      
      // Find existing item by checking all possible ID formats
      const existingItem = prevItems.find(item => 
        parseInt(item.product_id) === productId || 
        (item.id && parseInt(item.id) === productId)
      );
      
      if (existingItem) {
        console.log("Found existing item, updating quantity:", existingItem);
        
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
        quantity: quantityToAdd // Use our determined quantity
      };
      
      console.log("Adding new item to cart:", newItem);
      return [...prevItems, newItem];
    });
  };

  const updateQuantity = (productId, quantity) => {
    // Normalize productId to number
    const normalizedId = parseInt(productId);
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        parseInt(item.product_id) === normalizedId || (item.id && parseInt(item.id) === normalizedId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    // Normalize productId to number
    const normalizedId = parseInt(productId);
    
    setCartItems(prevItems =>
      prevItems.filter(item => 
        parseInt(item.product_id) !== normalizedId && 
        (!item.id || parseInt(item.id) !== normalizedId)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  };

  const value = {
    cartItems, // Expose cartItems directly
    cart: cartItems,
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