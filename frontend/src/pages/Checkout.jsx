import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import { createApiUrl } from '../config/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

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

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

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
                    <span className="item-name">{item.name} x {item.quantity}</span>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                className="place-order-button"
                onClick={handlePlaceOrder}
                disabled={!selectedAddress}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 