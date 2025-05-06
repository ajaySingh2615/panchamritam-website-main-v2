import React from 'react';
import { Link } from 'react-router-dom';

const CartItemRow = ({ item, onQuantityChange, onRemove }) => {
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
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex flex-col md:flex-row items-center py-4 border-b border-gray-200 hover:bg-gray-50">
      <div className="w-full md:w-1/2 flex items-center mb-4 md:mb-0">
        <div className="w-20 h-20 flex-shrink-0 mr-4 rounded-lg overflow-hidden">
          <img 
            src={item.image_url || '/placeholder-product.jpg'} 
            alt={item.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
        <div className="flex-grow">
          <Link 
            to={`/product/${item.product_id}`}
            className="font-medium text-indigo-600 hover:text-indigo-800 transition duration-300"
          >
            {item.name}
          </Link>
          <p className="text-sm text-gray-500">{item.category_name || 'Uncategorized'}</p>
        </div>
      </div>

      <div className="w-full md:w-1/6 flex justify-center items-center mb-4 md:mb-0">
        <span className="text-gray-700">£{item.price.toFixed(2)}</span>
      </div>

      <div className="w-full md:w-1/6 flex justify-center mb-4 md:mb-0">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button 
            onClick={decrementQuantity}
            className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-l-md"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-10 text-center py-1 border-0 focus:outline-none focus:ring-0"
          />
          <button 
            onClick={incrementQuantity}
            className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-r-md"
          >
            +
          </button>
        </div>
      </div>

      <div className="w-full md:w-1/6 flex justify-center items-center mb-4 md:mb-0">
        <span className="font-semibold text-gray-800">£{itemTotal.toFixed(2)}</span>
      </div>

      <div className="w-full md:w-1/12 flex justify-center items-center">
        <button 
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 p-1 focus:outline-none"
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