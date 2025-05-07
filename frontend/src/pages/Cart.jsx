import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CartItemRow from '../components/cart/CartItemRow';
import Breadcrumb from '../components/common/Breadcrumb';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    cartItems, 
    loading, 
    error, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/cart', message: 'Please login to proceed with checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  // For simplicity, we'll use a flat rate shipping fee for orders under a threshold
  const FREE_SHIPPING_THRESHOLD = 500; // ₹500 for free shipping
  const SHIPPING_COST = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? 50 : 0; // ₹50 shipping fee
  const total = subtotal + SHIPPING_COST;

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Cart', path: '/cart' }
  ];

  // Helper function to format price
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  return (
    <div className="bg-[#f8f6f3] min-h-screen pt-8 pb-12">
      <div className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9bc948]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">{error}</p>
                <button 
                  className="text-red-700 underline text-sm mt-1"
                  onClick={() => window.location.reload()}
                >
                  Try refreshing the page
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !cartItems.length ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <button 
              className="bg-[#9bc948] text-white py-2 px-6 rounded-md hover:bg-[#8ab938] transition duration-300"
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
                      key={item.product_id || item.cart_item_id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>

                <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-t border-gray-200">
                  <button 
                    className="text-red-500 hover:text-red-700 font-medium flex items-center"
                    onClick={clearCart}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Clear Cart
                  </button>
                  <Link
                    to="/shop"
                    className="bg-white border border-[#9bc948] text-[#9bc948] py-2 px-4 rounded-md hover:bg-[#f0f5e5] transition duration-300 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Shipping</span>
                    {SHIPPING_COST > 0 ? (
                      <span className="font-medium">₹{formatPrice(SHIPPING_COST)}</span>
                    ) : (
                      <span className="font-medium text-green-600">Free</span>
                    )}
                  </div>
                  {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm text-gray-600">
                        Add <span className="font-medium">₹{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more to qualify for free shipping
                      </p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-[#9bc948] h-2.5 rounded-full" 
                          style={{ width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-[#9bc948]">₹{formatPrice(total)}</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <button 
                    className="w-full bg-[#9bc948] text-white py-3 px-4 rounded-md hover:bg-[#8ab938] transition duration-300 flex items-center justify-center"
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </button>
                  
                  <div className="flex items-center justify-center text-gray-600 text-sm mt-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure Checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 