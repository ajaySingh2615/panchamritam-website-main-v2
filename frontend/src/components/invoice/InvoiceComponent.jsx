import React from 'react';
import { format } from 'date-fns';
import './InvoiceStyles.css';

const InvoiceComponent = ({ invoice, onPrint }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy');
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
        <button onClick={() => window.open(invoice.pdf_url, '_blank')} className="download-button">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>

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
            <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
            <p><strong>Order #:</strong> {invoice.order_id}</p>
            <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
          </div>
        </div>

        <div className="customer-details">
          <div className="billing-details">
            <h3>Bill To:</h3>
            <p>{invoice.customer_name}</p>
            <p>{invoice.billing_address?.address_line}</p>
            <p>{invoice.billing_address?.city}, {invoice.billing_address?.state} - {invoice.billing_address?.zip_code}</p>
            <p>Phone: {invoice.billing_address?.phone_number}</p>
            {invoice.customer_gstin && <p>GSTIN: {invoice.customer_gstin}</p>}
          </div>
          <div className="shipping-details">
            <h3>Ship To:</h3>
            <p>{invoice.customer_name}</p>
            <p>{invoice.shipping_address?.address_line}</p>
            <p>{invoice.shipping_address?.city}, {invoice.shipping_address?.state} - {invoice.shipping_address?.zip_code}</p>
            <p>Phone: {invoice.shipping_address?.phone_number}</p>
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
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name}</td>
                <td>{item.hsn_code || 'N/A'}</td>
                <td>{item.quantity}</td>
                <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                <td>₹{parseFloat(item.taxable_value).toFixed(2)}</td>
                <td>{item.tax_rate}%</td>
                <td>₹{parseFloat(item.tax_amount).toFixed(2)}</td>
                <td>₹{parseFloat(item.total_amount).toFixed(2)}</td>
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
                {invoice.tax_summary.map((tax, index) => (
                  <tr key={index}>
                    <td>{tax.hsn_code || 'N/A'}</td>
                    <td>₹{parseFloat(tax.taxable_amount).toFixed(2)}</td>
                    <td>₹{parseFloat(tax.cgst_amount).toFixed(2)} @ {tax.cgst_rate}%</td>
                    <td>₹{parseFloat(tax.sgst_amount).toFixed(2)} @ {tax.sgst_rate}%</td>
                    <td>₹{parseFloat(tax.igst_amount).toFixed(2)} @ {tax.igst_rate}%</td>
                    <td>₹{parseFloat(tax.total_tax).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>₹{parseFloat(invoice.total_tax).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>₹{parseFloat(invoice.shipping_fee).toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total:</span>
              <span>₹{parseFloat(invoice.total_amount).toFixed(2)}</span>
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