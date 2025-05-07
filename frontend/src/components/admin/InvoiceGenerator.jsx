import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TaxService from '../../services/taxService';
import { toast } from 'react-toastify';

const InvoiceGenerator = ({ orderId, customerEmail, invoiceNumber }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pdfBlob = await TaxService.generateInvoicePDF(orderId, token);
      TaxService.downloadInvoicePDF(pdfBlob, invoiceNumber);
      
      toast.success('Invoice PDF generated and downloaded successfully.');
    } catch (err) {
      setError('Failed to generate invoice PDF. Please try again.');
      toast.error('Failed to generate invoice PDF');
      console.error('Failed to generate PDF:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await TaxService.emailInvoice(orderId, customerEmail, token);
      
      toast.success(`Invoice sent to ${customerEmail} successfully.`);
    } catch (err) {
      setError('Failed to email invoice. Please try again.');
      toast.error('Failed to email invoice');
      console.error('Failed to email invoice:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="invoice-generator bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Invoice Actions</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGeneratePDF}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          {loading ? (
            <span className="inline-block animate-spin mr-2">⟳</span>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          Download Invoice PDF
        </button>
        
        {customerEmail && (
          <button
            onClick={handleEmailInvoice}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2">⟳</span>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
            Email Invoice to Customer
          </button>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: Invoices contain all tax details as per GST requirements.</p>
      </div>
    </div>
  );
};

export default InvoiceGenerator; 