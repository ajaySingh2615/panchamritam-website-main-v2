import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import TaxService from '../services/taxService';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(createApiUrl(`/orders/${orderId}`), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch order: ${response.status}`);
        
        const data = await response.json();
        setOrder(data.data.order);
        
        // Fetch invoice data
        const invoiceResponse = await fetch(createApiUrl(`/orders/${orderId}/invoice`), {
          headers: { 'Authorization': `Bearer ${token}` }
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
    
    if (token && orderId) fetchOrderDetails();
  }, [orderId, token]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateString);
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 border-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg text-center bg-white rounded-lg shadow-lg p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/orders" className="inline-block px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg text-center bg-white rounded-lg shadow-lg p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 mb-6">
            <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <Link to="/orders" className="inline-block px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Order success header */}
        <div className="bg-white rounded-t-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col items-center py-12 px-4 sm:px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="bg-white rounded-full p-3 mb-6">
              <svg className="h-12 w-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Order Confirmed!</h1>
            <p className="text-center text-emerald-50 max-w-md">
              Thank you for your purchase. We'll send you a confirmation email with order details shortly.
            </p>
          </div>
          
          {/* Order info strip */}
          <div className="flex flex-wrap justify-between items-center border-b border-gray-100 text-sm sm:text-base">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center border-b sm:border-b-0 sm:border-r border-gray-100 w-full sm:w-auto">
              <span className="text-gray-500 mb-1 sm:mb-0 sm:mr-2">Order Number:</span>
              <span className="font-medium">{order.order_id}</span>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center border-b sm:border-b-0 sm:border-r border-gray-100 w-full sm:w-auto">
              <span className="text-gray-500 mb-1 sm:mb-0 sm:mr-2">Date:</span>
              <span className="font-medium">{formatDate(order.order_date || order.created_at)}</span>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
              <span className="text-gray-500 mb-1 sm:mb-0 sm:mr-2">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : ''}
                ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Order details */}
        <div className="bg-white shadow-sm rounded-b-2xl overflow-hidden mb-6">
          {/* Items section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.order_item_id} className="flex flex-col sm:flex-row border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-24 h-24 bg-gray-100">
                    <img 
                      src={item.image_url || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {e.target.src = '/placeholder-product.jpg'}}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between w-full p-4">
                    <div className="mb-3 sm:mb-0">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{formatPrice(item.price)} per unit</p>
                        {item.hsn_code && <p className="text-xs text-gray-400">HSN: {item.hsn_code}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-500 mt-1">Inc. GST: ₹{formatPrice(item.tax_amount || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping & Payment section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {order.shipping_address ? (
                  <div className="space-y-1">
                    <p className="font-medium">{order.shipping_address.name || 'N/A'}</p>
                    <p className="text-gray-600">{order.shipping_address.address_line || order.address_line || 'N/A'}</p>
                    <p className="text-gray-600">{order.shipping_address.city || 'N/A'}, {order.shipping_address.state || 'N/A'} {order.shipping_address.zip_code || ''}</p>
                    <p className="text-gray-600">Phone: {order.shipping_address.phone_number || 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address information available</p>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">Payment Method</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  {order.payment_method === 'cod' ? (
                    <>
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Cash on Delivery</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="font-medium">Credit/Debit Card</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{formatPrice(order.subtotal || order.total_price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{order.shipping_fee ? `₹${formatPrice(order.shipping_fee)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>₹{formatPrice(order.total_tax || order.tax_amount || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total:</span>
                  <span>₹{formatPrice(order.total_price || order.total_amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Actions */}
        {invoice && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Invoice Documents</h2>
            <div className="flex flex-wrap gap-3">
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
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-white flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Invoice
              </button>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/orders" 
            className="flex-1 py-3.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-center text-gray-800 font-medium transition-colors shadow-sm"
          >
            View All Orders
          </Link>
          <Link 
            to="/shop" 
            className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-center text-white font-medium transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Questions about your order? <a href="/contact" className="text-emerald-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 