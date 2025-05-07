import React from 'react';
import { Link } from 'react-router-dom';

const CartItemRow = ({ item, onQuantityChange, onRemove, formatPrice }) => {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      onQuantityChange(item.product_id, newQuantity);
    }
  };

  const handleRemove = () => {
    onRemove(item.product_id);
  };

  const incrementQuantity = () => {
    onQuantityChange(item.product_id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.product_id, item.quantity - 1);
    } else {
      // If reducing below 1, remove the item
      onRemove(item.product_id);
    }
  };

  const itemTotal = parseFloat(item.price) * item.quantity;
  
  // Calculate discount if regular_price is available and higher than price
  const hasDiscount = item.regular_price && parseFloat(item.regular_price) > parseFloat(item.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(item.regular_price) - parseFloat(item.price)) / parseFloat(item.regular_price)) * 100) 
    : 0;

  return (
    <div className="flex flex-col md:flex-row items-center py-4 px-4 hover:bg-gray-50 transition duration-200">
      {/* Product Info - Mobile & Desktop */}
      <div className="w-full md:w-1/2 flex items-center mb-4 md:mb-0">
        <div className="w-20 h-20 flex-shrink-0 mr-4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <Link to={`/product/${item.product_id}`}>
            <img 
              src={item.image_url || '/placeholder-product.jpg'} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </Link>
        </div>
        <div className="flex-grow">
          <Link 
            to={`/product/${item.product_id}`}
            className="font-medium text-gray-800 hover:text-[#9bc948] transition duration-300"
          >
            {item.name}
          </Link>
          
          <div className="flex flex-col space-y-1 mt-1">
            {item.category_name && (
              <p className="text-xs text-gray-500">
                Category: {item.category_name}
              </p>
            )}
            
            {/* Show SKU if available */}
            {item.sku && (
              <p className="text-xs text-gray-500">
                SKU: {item.sku}
              </p>
            )}
            
            {/* Mobile-only price display */}
            <div className="md:hidden mt-2 flex items-center">
              <span className="font-semibold text-gray-800">₹{formatPrice ? formatPrice(item.price) : parseFloat(item.price).toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{formatPrice ? formatPrice(item.regular_price) : parseFloat(item.regular_price).toFixed(2)}
                  </span>
                  <span className="ml-2 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price - Desktop only */}
      <div className="hidden md:flex w-1/6 justify-center items-center">
        <div className="flex flex-col items-center">
          <span className="text-gray-800 font-medium">₹{formatPrice ? formatPrice(item.price) : parseFloat(item.price).toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ₹{formatPrice ? formatPrice(item.regular_price) : parseFloat(item.regular_price).toFixed(2)}
              </span>
              <span className="mt-1 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">
                {discountPercentage}% OFF
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="w-full md:w-1/6 flex justify-center my-4 md:my-0">
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button 
            onClick={decrementQuantity}
            className="px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-12 text-center py-1 border-0 focus:outline-none focus:ring-0"
            aria-label="Product quantity"
          />
          <button 
            onClick={incrementQuantity}
            className="px-3 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Item Total */}
      <div className="w-full md:w-1/6 flex justify-center items-center font-semibold text-gray-800 mb-4 md:mb-0">
        ₹{formatPrice ? formatPrice(itemTotal) : itemTotal.toFixed(2)}
      </div>

      {/* Remove Button */}
      <div className="w-full md:w-1/12 flex justify-center items-center">
        <button 
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-600 p-1 transition-colors rounded-full hover:bg-red-50"
          aria-label="Remove item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItemRow; 