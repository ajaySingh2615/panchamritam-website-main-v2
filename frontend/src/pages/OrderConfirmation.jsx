import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import InvoiceComponent from '../components/invoice/InvoiceComponent';
import TaxService from '../services/taxService';

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
    if (!dateString) {
      return 'N/A';
    }
    
    // Check if the date is valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateString);
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(parseFloat(price))) {
      return '0.00';
    }
    return parseFloat(price).toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] text-center">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/orders" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-gray-700">
          View All Orders
        </Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] text-center">
        <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/orders" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-gray-700">
          View All Orders
        </Link>
      </div>
    );
  }
  
  if (viewInvoice && invoice) {
    return (
      <div className="p-4 md:p-6 bg-gray-50">
        <button 
          onClick={() => setViewInvoice(false)} 
          className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-gray-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Order
        </button>
        <InvoiceComponent 
          invoice={invoice} 
          orderId={orderId}
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white">
      <div className="text-center py-8 border-b border-gray-200 mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Your order has been received and is now being processed. You will receive an email confirmation shortly.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between md:block">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-800">{order.order_id}</span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium text-gray-800">{formatDate(order.order_date || order.created_at)}</span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-800">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
              </span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-gray-600">Order Status:</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Items Ordered */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.order_item_id} className="flex flex-col md:flex-row items-start border rounded-lg overflow-hidden">
                <div className="w-full md:w-24 h-24 bg-gray-100 flex-shrink-0">
                  <img 
                    src={item.product_image || '/placeholder-product.jpg'} 
                    alt={item.product_name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-medium text-gray-800">{item.product_name}</h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{formatPrice(item.unit_price)} per unit</p>
                    {item.hsn_code && <p>HSN: {item.hsn_code}</p>}
                  </div>
                </div>
                <div className="p-4 text-right">
                  <p className="font-medium text-gray-800">₹{formatPrice(item.total_price)}</p>
                  <p className="text-sm text-gray-500">Including GST: ₹{formatPrice(item.tax_amount || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shipping and Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {order.shipping_address ? (
                <div className="space-y-1">
                  <p className="font-medium">{order.shipping_address.name || 'N/A'}</p>
                  <p>{order.shipping_address.address_line || order.address_line || 'N/A'}</p>
                  <p>{order.shipping_address.city || 'N/A'}, {order.shipping_address.state || 'N/A'} {order.shipping_address.zip_code || ''}</p>
                  <p>Phone: {order.shipping_address.phone_number || 'N/A'}</p>
                </div>
              ) : (
                <p className="text-gray-500">No shipping address information available</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Total</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{formatPrice(order.subtotal || order.total_price || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>₹{formatPrice(order.shipping_fee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{formatPrice(order.total_tax || order.tax_amount || 0)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total:</span>
                <span>₹{formatPrice(order.total_price || order.total_amount || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Actions */}
        {invoice && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => setViewInvoice(true)} 
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Invoice
            </button>
            
            <button 
              onClick={async () => {
                try {
                  const pdfBlob = await TaxService.generateInvoicePDF(orderId, token);
                  TaxService.downloadInvoicePDF(pdfBlob, invoice.invoice_number || `INV-${orderId}`);
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  alert('Failed to download invoice PDF. Please try again later.');
                }
              }} 
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors text-white flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice
            </button>
            
            <button 
              onClick={() => {
                const email = prompt('Enter email address to send invoice:');
                if (email && email.includes('@')) {
                  TaxService.emailInvoice(orderId, email, token)
                    .then(() => alert(`Invoice sent to ${email}`))
                    .catch(err => {
                      console.error('Error sending invoice:', err);
                      alert('Failed to send invoice email. Please try again later.');
                    });
                } else if (email) {
                  alert('Please enter a valid email address');
                }
              }} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-white flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Invoice
            </button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Link 
            to="/orders" 
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-center text-gray-700 font-medium transition-colors"
          >
            View All Orders
          </Link>
          <Link 
            to="/shop" 
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 rounded-md text-center text-white font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 