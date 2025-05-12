import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import { createApiUrl } from '../config/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cartTotals, setCartTotals] = useState({ subtotal: '0.00', tax: '0.00', total: '0.00' });
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [taxBreakdown, setTaxBreakdown] = useState([]);

  useEffect(() => {
    // Update cart totals from CartContext
    setCartTotals(getCartTotal());

    // Group tax by rates for breakdown
    const taxGroups = {};
    
    cartItems.forEach(item => {
      const taxRate = item.tax_rate || 0;
      const itemSubtotal = parseFloat(item.price) * item.quantity;
      const itemTax = itemSubtotal * taxRate / 100;
      
      if (!taxGroups[taxRate]) {
        taxGroups[taxRate] = {
          rate: taxRate,
          taxable_amount: 0,
          tax_amount: 0,
          items: []
        };
      }
      
      taxGroups[taxRate].taxable_amount += itemSubtotal;
      taxGroups[taxRate].tax_amount += itemTax;
      taxGroups[taxRate].items.push(item);
    });
    
    setTaxBreakdown(Object.values(taxGroups));
  }, [cartItems, getCartTotal]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await fetch(createApiUrl('/addresses'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch addresses');
        }

        const data = await response.json();
        setAddresses(data.data.addresses || []);
        
        if (data.data.addresses && data.data.addresses.length > 0) {
          setSelectedAddress(data.data.addresses[0].address_id);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchAddresses();
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [user, navigate, token]);

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      setError(null);
      
      const orderData = {
        address_id: selectedAddress,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch(createApiUrl('/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      setOrderPlaced(true);
      clearCart();
      
      // Redirect to order confirmation page
      navigate(`/order-confirmation/${data.data.order.order_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <p className="text-gray-700">Loading checkout information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow flex flex-col items-center">
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <button className="mt-2 px-4 py-2 rounded bg-green-600 text-white" onClick={() => setError(null)}>Close</button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow flex flex-col items-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-700 mb-4">Thank you for your purchase. You will receive a confirmation email shortly.</p>
          <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => setOrderPlaced(false)}>Close</button>
        </div>
      </div>
    );
  }

  // Calculate shipping cost
  const FREE_SHIPPING_THRESHOLD = 500;
  const shipping = parseFloat(cartTotals.subtotal) > 0 && parseFloat(cartTotals.subtotal) < FREE_SHIPPING_THRESHOLD ? 50 : 0;
  const grandTotal = parseFloat(cartTotals.subtotal) + parseFloat(cartTotals.tax) + shipping;

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Cart', path: '/cart' },
    { label: 'Checkout', path: '/checkout' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2">
      <div className="max-w-5xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Address Section */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Shipping Address</h2>
              <div className="flex flex-col gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.address_id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 cursor-pointer ${selectedAddress === address.address_id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
                    onClick={() => handleAddressSelect(address.address_id)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{address.name}</p>
                      <p className="text-gray-600 text-sm">{address.address_line}</p>
                      <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.zip_code}</p>
                      <p className="text-gray-500 text-xs">{address.phone_number}</p>
                    </div>
                    <button className={`ml-4 px-4 py-2 rounded border font-medium transition ${selectedAddress === address.address_id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-600 border-green-500 hover:bg-green-50'}`}>{selectedAddress === address.address_id ? 'Selected' : 'Select'}</button>
                  </div>
                ))}
                <button 
                  className="w-full py-3 border-2 border-dashed border-green-400 rounded-lg text-green-700 font-semibold hover:bg-green-50 transition"
                  onClick={() => navigate('/address/add')}
                >
                  + Add New Address
                </button>
              </div>
            </section>
            {/* Payment Section */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Payment Method</h2>
              <div className="flex flex-col gap-4">
                <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}> 
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handlePaymentMethodChange('cod')}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="font-medium text-gray-700">Cash on Delivery</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition ${paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}> 
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => handlePaymentMethodChange('card')}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="font-medium text-gray-700">Credit/Debit Card</span>
                </label>
              </div>
            </section>
          </div>
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Order Summary</h2>
              <div className="mb-4 divide-y">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex justify-between py-2 text-gray-700 text-sm">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-500">x {item.quantity}</span>
                    </div>
                    <span className="font-semibold">₹{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{formatPrice(cartTotals.subtotal)}</span>
                </div>
                {parseFloat(cartTotals.tax) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center">
                      Tax
                      <button
                        onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                        className="ml-2 text-xs text-green-600 underline"
                      >
                        {showTaxBreakdown ? '(hide details)' : '(show details)'}
                      </button>
                    </span>
                    <span>₹{formatPrice(cartTotals.tax)}</span>
                  </div>
                )}
                {showTaxBreakdown && taxBreakdown.length > 0 && (
                  <div className="bg-gray-50 rounded p-2 mt-2">
                    {taxBreakdown.map((taxGroup, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-500">
                        <span>GST {taxGroup.rate}%</span>
                        <span>₹{formatPrice(taxGroup.tax_amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping > 0 ? (
                    <span>₹{formatPrice(shipping)}</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Free</span>
                  )}
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-4 mt-2">
                  <span>Total</span>
                  <span>₹{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <button 
                className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition ${placingOrder ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || placingOrder}
              >
                {placingOrder ? (
                  <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Processing...</span>
                ) : (
                  'Place Order'
                )}
              </button>
              <div className="mt-4 text-xs text-gray-500 text-center">
                By placing your order, you agree to our <a href="/terms" className="underline text-green-600">Terms & Conditions</a> and acknowledge our <a href="/privacy" className="underline text-green-600">Privacy Policy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 