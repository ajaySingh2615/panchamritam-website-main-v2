import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import InvoiceComponent from '../components/invoice/InvoiceComponent';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(createApiUrl(`/orders/${orderId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.status}`);
        }
        
        const data = await response.json();
        setOrder(data.data.order);
        
        // Fetch invoice data
        const invoiceResponse = await fetch(createApiUrl(`/orders/${orderId}/invoice`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          setInvoice(invoiceData.data.invoice);
        }
        
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (token && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, token]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="order-confirmation loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="order-confirmation error">
        <div className="error-icon">❌</div>
        <h1>Error Loading Order</h1>
        <p>{error}</p>
        <Link to="/orders" className="back-link">View All Orders</Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="order-confirmation error">
        <div className="error-icon">⚠️</div>
        <h1>Order Not Found</h1>
        <p>We couldn't find the order you're looking for.</p>
        <Link to="/orders" className="back-link">View All Orders</Link>
      </div>
    );
  }
  
  if (viewInvoice && invoice) {
    return (
      <div className="invoice-view">
        <button onClick={() => setViewInvoice(false)} className="back-button">
          Back to Order
        </button>
        <InvoiceComponent invoice={invoice} />
      </div>
    );
  }
  
  return (
    <div className="order-confirmation">
      <div className="order-confirmation-header">
        <div className="order-status-icon success">
          <svg viewBox="0 0 24 24" fill="none" className="checkmark">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>Thank You for Your Order!</h1>
        <p className="confirmation-message">
          Your order has been received and is now being processed. You will receive an email confirmation shortly.
        </p>
      </div>
      
      <div className="order-details-container">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-meta">
            <div className="order-meta-item">
              <span>Order Number:</span>
              <span>{order.order_id}</span>
            </div>
            <div className="order-meta-item">
              <span>Order Date:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="order-meta-item">
              <span>Payment Method:</span>
              <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}</span>
            </div>
            <div className="order-meta-item">
              <span>Order Status:</span>
              <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
          </div>
        </div>
        
        <div className="order-items">
          <h2>Items Ordered</h2>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.order_item_id} className="order-item">
                <div className="item-image">
                  <img src={item.product_image || '/placeholder-product.jpg'} alt={item.product_name} />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product_name}</h3>
                  <p className="item-meta">Quantity: {item.quantity}</p>
                  <p className="item-meta">Price: ₹{formatPrice(item.unit_price)} per unit</p>
                  {item.hsn_code && <p className="item-meta">HSN: {item.hsn_code}</p>}
                </div>
                <div className="item-price">
                  <p className="item-total">₹{formatPrice(item.total_price)}</p>
                  <p className="item-tax-info">Including GST: ₹{formatPrice(item.tax_amount || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-totals-shipping">
          <div className="shipping-info">
            <h2>Shipping Address</h2>
            <div className="address-details">
              <p>{order.shipping_address.name}</p>
              <p>{order.shipping_address.address_line}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
              <p>Phone: {order.shipping_address.phone_number}</p>
            </div>
          </div>
          
          <div className="order-totals">
            <h2>Order Total</h2>
            <div className="totals-breakdown">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{formatPrice(order.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>₹{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>₹{formatPrice(order.tax_amount || 0)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>₹{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {invoice && (
          <div className="invoice-actions">
            <button 
              onClick={() => setViewInvoice(true)} 
              className="view-invoice-button"
            >
              View Invoice
            </button>
          </div>
        )}
        
        <div className="order-actions">
          <Link to="/orders" className="action-button secondary">
            View All Orders
          </Link>
          <Link to="/shop" className="action-button primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 