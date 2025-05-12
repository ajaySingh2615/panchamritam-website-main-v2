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
        const orderData = data.data.order;
        
        // Fetch invoice data
        const invoiceResponse = await fetch(createApiUrl(`/orders/${orderId}/invoice`), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          setInvoice(invoiceData.data.invoice);
          
          // Add shipping address from invoice to order data if available and not already in order
          if (invoiceData.data.invoice && invoiceData.data.invoice.shipping_address && !orderData.shipping_address) {
            const invoiceAddress = invoiceData.data.invoice.shipping_address;
            orderData.shipping_address = {
              ...invoiceAddress,
              // Ensure field names match database conventions
              phone_number: invoiceAddress.phone_number,
              address_line: invoiceAddress.address_line || invoiceAddress.address_line1 || null,
              zip_code: invoiceAddress.zip_code || invoiceAddress.postal_code || null
            };
          }
        }
        
        setOrder(orderData);
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
  
  // Function to get a customer-friendly status label
  const getStatusLabel = (status) => {
    if (status === 'pending') return 'Order Received';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-emerald-100 rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium text-lg">Loading your order details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="w-full max-w-lg text-center bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-6">
            <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Order</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/orders" className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md">
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="w-full max-w-lg text-center bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50 mb-6">
            <svg className="h-10 w-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Link to="/orders" className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md">
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="max-w-4xl mx-auto">
        {/* Order success header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col items-center py-12 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="bg-white rounded-full p-4 mb-6 shadow-md">
              <svg className="h-14 w-14 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">Order Confirmed!</h1>
            <p className="text-center text-emerald-50 max-w-md text-lg">
              Thank you for your purchase. We'll send you a confirmation email with order details shortly.
            </p>
          </div>
          
          {/* Order info strip */}
          <div className="flex flex-wrap justify-between items-center border-b border-gray-100 text-sm sm:text-base px-2">
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center border-b sm:border-b-0 sm:border-r border-gray-100 w-full sm:w-auto">
              <span className="text-gray-500 mb-1 sm:mb-0 sm:mr-2 font-medium">Order Number:</span>
              <span className="font-semibold text-gray-800">{order.order_id}</span>
            </div>
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center border-b sm:border-b-0 sm:border-r border-gray-100 w-full sm:w-auto">
              <span className="text-gray-500 mb-1 sm:mb-0 sm:mr-2 font-medium">Date:</span>
              <span className="font-semibold text-gray-800">{formatDate(order.order_date || order.created_at)}</span>
            </div>
            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
              <span className="text-gray-500 mb-1 sm:mb-0 sm:mr-2 font-medium">Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : ''}
                ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        
          {/* Items section */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Items Ordered
            </h2>
            <div className="space-y-5">
              {order.items.map((item) => (
                <div key={item.order_item_id} className="flex flex-col sm:flex-row border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
                  <div className="w-full sm:w-28 h-28 bg-gray-50 flex-shrink-0">
                    <img 
                      src={item.image_url || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {e.target.src = '/placeholder-product.jpg'}}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between w-full p-5">
                    <div className="mb-3 sm:mb-0">
                      <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Quantity: <span className="font-medium">{item.quantity}</span></p>
                        <p>Price: <span className="font-medium">₹{formatPrice(item.price)}</span> per unit</p>
                        {item.hsn_code && <p className="text-xs text-gray-400 mt-1">HSN: {item.hsn_code}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-lg">₹{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-500 mt-1">Inc. GST: ₹{formatPrice(item.tax_amount || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping & Payment section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h2>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                {order.shipping_address ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-800">{order.shipping_address.name || 'N/A'}</p>
                    <p className="text-gray-600">{order.shipping_address.address_line || order.address_line || 'N/A'}</p>
                    <p className="text-gray-600">{order.shipping_address.city || 'N/A'}, {order.shipping_address.state || 'N/A'} {order.shipping_address.zip_code || ''}</p>
                    <p className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {order.shipping_address.phone_number || 'N/A'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address information available</p>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payment Method
              </h2>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="flex items-center">
                  {order.payment_method === 'cod' ? (
                    <>
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800">Cash on Delivery</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-indigo-100 p-3 rounded-full mr-4">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800">Credit/Debit Card</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Order Summary
              </h2>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="space-y-3 border-b border-gray-200 pb-5 mb-5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{formatPrice(order.subtotal || order.total_price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{order.shipping_fee ? `₹${formatPrice(order.shipping_fee)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{formatPrice(order.total_tax || order.tax_amount || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-xl">
                  <span>Total:</span>
                  <span>₹{formatPrice(order.total_price || order.total_amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Actions */}
        {invoice && (
          <div className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
              <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoice Documents
            </h2>
            <div className="flex flex-wrap gap-4">
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
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-white flex items-center shadow-md"
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
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white flex items-center shadow-md"
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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/orders" 
            className="flex-1 py-4 px-5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-center text-gray-800 font-medium transition-colors shadow-md flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Orders
          </Link>
          <Link 
            to="/shop" 
            className="flex-1 py-4 px-5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-center text-white font-medium transition-colors shadow-md flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
        </div>
        
        {/* Additional Info */}
        <div className="text-center bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <p className="text-gray-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Questions about your order? <a href="/contact" className="text-emerald-600 hover:underline font-medium ml-1">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 