import React, { useState } from 'react';
import { format } from 'date-fns';
import TaxService from '../../services/taxService';
import './InvoiceStyles.css';

const InvoiceComponent = ({ invoice, onPrint, orderId }) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (!invoice) return null;

  // Ensure all required objects exist to prevent errors
  const safeInvoice = {
    invoice: invoice.invoice || {},
    customer: invoice.customer || {},
    shipping_address: invoice.shipping_address || {},
    items: invoice.items || [],
    summary: invoice.summary || { 
      subtotal: 0, 
      tax_breakdown: [],
      total_tax: 0,
      total: 0 
    },
    payment: invoice.payment || { 
      method: 'N/A', 
      status: 'N/A' 
    },
    tax_summary: invoice.tax_summary || []
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !orderId) {
        alert('Cannot download invoice: missing authentication or order information');
        return;
      }
      
      // Use the TaxService to get the PDF
      const pdfBlob = await TaxService.generateInvoicePDF(orderId, token);
      
      // Download the file using the TaxService utility
      TaxService.downloadInvoicePDF(pdfBlob, safeInvoice.invoice.invoice_number || `INV-${orderId}`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download invoice PDF. Please try again later.');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailAddress || !emailAddress.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    try {
      setSendingEmail(true);
      setEmailError('');
      
      const token = localStorage.getItem('token');
      
      if (!token || !orderId) {
        throw new Error('Missing authentication or order information');
      }
      
      // Send email using TaxService
      await TaxService.emailInvoice(orderId, emailAddress, token);
      
      // Update UI to show success
      setEmailSent(true);
      setShowEmailForm(false);
      setTimeout(() => setEmailSent(false), 5000); // Hide success message after 5 seconds
    } catch (error) {
      console.error('Error sending invoice email:', error);
      setEmailError('Failed to send email. Please try again later.');
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'N/A';
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(parseFloat(price))) {
      return '0.00';
    }
    return parseFloat(price).toFixed(2);
  };

  return (
    <div className="invoice-container">
      <div className="invoice-actions">
        <button onClick={handlePrint} className="print-button">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
        <button onClick={handleDownloadPDF} className="download-button">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
        <button onClick={() => setShowEmailForm(!showEmailForm)} className="email-button">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Invoice
        </button>
      </div>
      
      {showEmailForm && (
        <div className="email-form-container">
          <form onSubmit={handleEmailSubmit} className="email-form">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email address"
              required
              className="email-input"
            />
            <button 
              type="submit" 
              className="send-email-button"
              disabled={sendingEmail}
            >
              {sendingEmail ? 'Sending...' : 'Send'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setShowEmailForm(false)}
            >
              Cancel
            </button>
          </form>
          {emailError && <p className="email-error">{emailError}</p>}
        </div>
      )}
      
      {emailSent && (
        <div className="email-success">
          Invoice has been sent to {emailAddress}
        </div>
      )}

      <div className="invoice-content">
        <div className="invoice-header">
          <div className="company-details">
            <h1>Panchamritam</h1>
            <p>123 Ayurveda Street, Chennai, TN 600001</p>
            <p>GSTIN: {invoice.company_gstin || '33AABCP1234A1Z5'}</p>
            <p>Phone: +91 98765 43210</p>
            <p>Email: info@panchamritam.com</p>
          </div>
          <div className="invoice-details">
            <h2>TAX INVOICE</h2>
            <p><strong>Invoice #:</strong> {safeInvoice.invoice.invoice_number || `INV-${orderId || 'Unknown'}`}</p>
            <p><strong>Order #:</strong> {safeInvoice.invoice.order_id || orderId || 'Unknown'}</p>
            <p><strong>Date:</strong> {formatDate(safeInvoice.invoice.invoice_date)}</p>
          </div>
        </div>

        <div className="customer-details">
          <div className="billing-details">
            <h3>Bill To:</h3>
            <p>{safeInvoice.customer.name || 'N/A'}</p>
            <p>{safeInvoice.billing_address?.address_line || safeInvoice.shipping_address?.address_line1 || 'N/A'}</p>
            <p>{safeInvoice.billing_address?.city || safeInvoice.shipping_address?.city || 'N/A'}, {safeInvoice.billing_address?.state || safeInvoice.shipping_address?.state || 'N/A'} - {safeInvoice.billing_address?.zip_code || safeInvoice.shipping_address?.postal_code || 'N/A'}</p>
            <p>Phone: {safeInvoice.billing_address?.phone_number || safeInvoice.customer.phone || 'N/A'}</p>
            {invoice.customer_gstin && <p>GSTIN: {invoice.customer_gstin}</p>}
          </div>
          <div className="shipping-details">
            <h3>Ship To:</h3>
            <p>{safeInvoice.customer.name || 'N/A'}</p>
            <p>{safeInvoice.shipping_address?.address_line1 || safeInvoice.shipping_address?.address_line || 'N/A'}</p>
            <p>{safeInvoice.shipping_address?.city || 'N/A'}, {safeInvoice.shipping_address?.state || 'N/A'} - {safeInvoice.shipping_address?.postal_code || safeInvoice.shipping_address?.zip_code || 'N/A'}</p>
            <p>Phone: {safeInvoice.shipping_address?.phone || safeInvoice.shipping_address?.phone_number || safeInvoice.customer.phone || 'N/A'}</p>
          </div>
        </div>

        <table className="invoice-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>HSN/SAC</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Taxable Value</th>
              <th>GST Rate</th>
              <th>GST Amount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {safeInvoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name || item.name || 'Product'}</td>
                <td>{item.hsn_code || 'N/A'}</td>
                <td>{item.quantity}</td>
                <td>₹{formatPrice(item.unit_price || item.price)}</td>
                <td>₹{formatPrice(item.taxable_value || (item.price * item.quantity))}</td>
                <td>{(item.tax_rate || 0)}%</td>
                <td>₹{formatPrice(item.tax_amount || 0)}</td>
                <td>₹{formatPrice(item.total_amount || item.total || ((parseFloat(item.price) * item.quantity) + parseFloat(item.tax_amount || 0)))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div className="tax-breakdown">
            <h3>Tax Breakdown</h3>
            <table className="tax-summary-table">
              <thead>
                <tr>
                  <th>HSN/SAC</th>
                  <th>Taxable Amount</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {(safeInvoice.tax_summary || safeInvoice.summary.tax_breakdown || []).map((tax, index) => (
                  <tr key={index}>
                    <td>{tax.hsn_code || 'N/A'}</td>
                    <td>₹{formatPrice(tax.taxable_amount)}</td>
                    <td>₹{formatPrice(tax.cgst_amount || tax.tax_amount / 2 || 0)} @ {tax.cgst_rate || tax.rate / 2 || 0}%</td>
                    <td>₹{formatPrice(tax.sgst_amount || tax.tax_amount / 2 || 0)} @ {tax.sgst_rate || tax.rate / 2 || 0}%</td>
                    <td>₹{formatPrice(tax.igst_amount || 0)} @ {tax.igst_rate || 0}%</td>
                    <td>₹{formatPrice(tax.total_tax || tax.tax_amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{formatPrice(safeInvoice.summary.subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>₹{formatPrice(safeInvoice.summary.total_tax)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>₹{formatPrice(safeInvoice.shipping_fee || 0)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total:</span>
              <span>₹{formatPrice(safeInvoice.summary.total)}</span>
            </div>
          </div>
        </div>

        <div className="invoice-footer">
          <div className="terms-conditions">
            <h3>Terms & Conditions</h3>
            <p>1. Payment is due within 30 days.</p>
            <p>2. Products once sold cannot be returned.</p>
            <p>3. This is a computer-generated invoice, no signature required.</p>
          </div>
          <div className="invoice-signature">
            <p>For Panchamritam</p>
            <div className="signature-placeholder"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceComponent; 