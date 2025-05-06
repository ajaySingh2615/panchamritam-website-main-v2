import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const { cart, addToCart, updateCartItemQuantity, removeFromCart } = useCart();
  
  const cartItem = cart.find(item => item.product_id === product.product_id);
  const isInCart = Boolean(cartItem);
  
  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : (typeof price === 'number' ? price : 0);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    // Create a modified product with quantity explicitly set to 1
    const productToAdd = {
      ...product,
      cartQuantity: 1 // Using a different property name to avoid confusion with stock quantity
    };
    addToCart(productToAdd);
  };
  
  const handleIncreaseQuantity = (e) => {
    e.preventDefault();
    if (cartItem) {
      updateCartItemQuantity(product.product_id, cartItem.quantity + 1);
    }
  };
  
  const handleDecreaseQuantity = (e) => {
    e.preventDefault();
    if (cartItem && cartItem.quantity > 1) {
      updateCartItemQuantity(product.product_id, cartItem.quantity - 1);
    } else if (cartItem && cartItem.quantity === 1) {
      removeFromCart(product.product_id);
    }
  };

  const isOnSale = product.regular_price && parseFloat(product.regular_price) > parseFloat(product.price);

  return (
    <div className="product-card bg-[#f8f6f3] rounded-lg overflow-hidden group relative">
      {/* Sale badge */}
      {isOnSale && <div className="sale-badge">Sale!</div>}
      
      <Link to={`/product/${product.product_id}`} className="block">
        <div className="product-image-container">
          <img 
            src={product.image_url || '/placeholder-product.jpg'} 
            alt={product.name} 
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.product_id}`} className="block">
          <div className="text-gray-500 text-sm mb-1">
            {product.category_name || 'Uncategorized'}
          </div>
          
          <h3 className="text-gray-800 font-bold text-lg mb-3 hover:text-[#9bc948] transition duration-300">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            {isOnSale ? (
              <div className="flex items-center">
                <span className="text-gray-400 line-through text-sm mr-2">
                  ₹{formatPrice(product.regular_price)}
                </span>
                <span className="text-[#9bc948] font-bold text-lg">
                  ₹{formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-[#9bc948] font-bold text-lg">
                ₹{formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {isInCart ? (
            <div className="inline-flex items-center shadow-sm rounded-md overflow-hidden">
              <button 
                onClick={handleDecreaseQuantity}
                className="bg-[#9bc948] text-white w-6 h-6 flex items-center justify-center hover:bg-[#8ab938] active:bg-[#7aa828] transition-colors duration-150 focus:outline-none"
                aria-label="Decrease quantity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className="bg-white px-2.5 h-6 flex items-center justify-center text-sm font-medium text-gray-800 min-w-[24px] border-t border-b border-gray-200">
                {cartItem.quantity}
              </span>
              <button 
                onClick={handleIncreaseQuantity}
                className="bg-[#9bc948] text-white w-6 h-6 flex items-center justify-center hover:bg-[#8ab938] active:bg-[#7aa828] transition-colors duration-150 focus:outline-none"
                aria-label="Increase quantity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="bg-[#9bc948] text-white p-2 rounded-full hover:bg-[#8ab938] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#9bc948] focus:ring-opacity-50"
              aria-label="Add to cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 