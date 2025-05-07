import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import { createApiUrl } from '../config/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
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
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading checkout information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="success-container">
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
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
    <div className="checkout-page">
      <div className="checkout-container">
        <Breadcrumb items={breadcrumbItems} />

        <h1>Checkout</h1>

        <div className="checkout-content">
          <div className="checkout-main">
            <section className="address-section">
              <h2>Shipping Address</h2>
              <div className="address-list">
                {addresses.map((address) => (
                  <div
                    key={address.address_id}
                    className={`address-card ${selectedAddress === address.address_id ? 'selected' : ''}`}
                    onClick={() => handleAddressSelect(address.address_id)}
                  >
                    <div className="address-details">
                      <p className="address-name">{address.name}</p>
                      <p className="address-street">{address.address_line}</p>
                      <p className="address-city">
                        {address.city}, {address.state} {address.zip_code}
                      </p>
                      <p className="address-phone">{address.phone_number}</p>
                    </div>
                    <button className="select-address-button">
                      {selectedAddress === address.address_id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
                <button 
                  className="add-address-button"
                  onClick={() => navigate('/address/add')}
                >
                  + Add New Address
                </button>
              </div>
            </section>

            <section className="payment-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handlePaymentMethodChange('cod')}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => handlePaymentMethodChange('card')}
                  />
                  <span>Credit/Debit Card</span>
                </label>
              </div>
            </section>
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x {item.quantity}</span>
                    </div>
                    <span className="item-price">₹{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{formatPrice(cartTotals.subtotal)}</span>
                </div>
                
                {parseFloat(cartTotals.tax) > 0 && (
                  <div className="summary-row">
                    <span className="flex items-center">
                      Tax
                      <button
                        onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                        className="tax-details-toggle"
                      >
                        {showTaxBreakdown ? '(hide details)' : '(show details)'}
                      </button>
                    </span>
                    <span>₹{formatPrice(cartTotals.tax)}</span>
                  </div>
                )}
                
                {showTaxBreakdown && taxBreakdown.length > 0 && (
                  <div className="tax-breakdown">
                    {taxBreakdown.map((taxGroup, index) => (
                      <div key={index} className="tax-breakdown-row">
                        <span>GST {taxGroup.rate}%</span>
                        <span>₹{formatPrice(taxGroup.tax_amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="summary-row">
                  <span>Shipping</span>
                  {shipping > 0 ? (
                    <span>₹{formatPrice(shipping)}</span>
                  ) : (
                    <span className="free-shipping">Free</span>
                  )}
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{formatPrice(grandTotal)}</span>
                </div>
              </div>
              
              <button 
                className="place-order-button"
                onClick={handlePlaceOrder}
                disabled={!selectedAddress}
              >
                Place Order
              </button>
              
              <div className="checkout-note">
                <p>
                  By placing your order, you agree to our <a href="/terms">Terms & Conditions</a> and acknowledge our <a href="/privacy">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 