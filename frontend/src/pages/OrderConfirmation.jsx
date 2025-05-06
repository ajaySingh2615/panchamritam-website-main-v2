import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrder();
    } else {
      navigate('/login', { state: { from: `/order-confirmation/${orderId}` } });
    }
  }, [orderId, user, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Order not found'}</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Orders', path: '/orders' },
    { label: `Order #${order.order_id}`, path: `/order-confirmation/${order.order_id}` }
  ];

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="confirmation-header">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>Order Confirmed!</h1>
          <p className="order-number">Order #{order.order_id}</p>
        </div>

        <div className="confirmation-content">
          <div className="confirmation-section">
            <h2>Order Details</h2>
            <div className="order-info">
              <div className="info-row">
                <span>Order Date:</span>
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Payment Method:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="confirmation-section">
            <h2>Shipping Address</h2>
            <div className="address-info">
              <p className="address-name">{order.address.name}</p>
              <p className="address-street">{order.address.address_line}</p>
              <p className="address-city">
                {order.address.city}, {order.address.state} {order.address.zip_code}
              </p>
              <p className="address-phone">{order.address.phone_number}</p>
            </div>
          </div>

          <div className="confirmation-section">
            <h2>Order Items</h2>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.order_item_id} className="order-item">
                  <div className="item-details">
                    <img 
                      src={item.image_url || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="confirmation-section">
            <h2>Order Summary</h2>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button 
            className="continue-shopping-button"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
          <button 
            className="view-orders-button"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 