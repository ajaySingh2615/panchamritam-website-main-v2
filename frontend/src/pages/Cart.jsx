import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartItemRow from '../components/cart/CartItemRow';
import Breadcrumb from '../components/common/Breadcrumb';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const shipping = subtotal > 0 ? 10 : 0; // Example shipping cost
  const total = subtotal + shipping;

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Cart', path: '/cart' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-12">
      <div className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <button 
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300"
              onClick={() => navigate('/shop')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 hidden md:flex">
                  <div className="w-1/2 font-semibold text-gray-600">Product</div>
                  <div className="w-1/6 text-center font-semibold text-gray-600">Price</div>
                  <div className="w-1/6 text-center font-semibold text-gray-600">Quantity</div>
                  <div className="w-1/6 text-center font-semibold text-gray-600">Total</div>
                  <div className="w-1/12"></div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.product_id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>

                <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-t border-gray-200">
                  <button 
                    className="text-red-500 hover:text-red-700 font-medium flex items-center"
                    onClick={clearCart}
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Clear Cart
                  </button>
                  <button 
                    className="bg-indigo-50 text-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-100 transition duration-300 flex items-center"
                    onClick={() => navigate('/shop')}
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">£{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-indigo-600">£{total.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  className="w-full mt-8 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
                  onClick={handleCheckout}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 