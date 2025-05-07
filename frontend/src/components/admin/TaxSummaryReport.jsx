import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import TaxService from '../../services/taxService';
import { toast } from 'react-toastify';

const TaxSummaryReport = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxSummary, setTaxSummary] = useState(null);
  
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleQuickSelect = (months) => {
    const end = new Date();
    const start = startOfMonth(subMonths(end, months));
    
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };
  
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await TaxService.getTaxSummary(
        dateRange.startDate, 
        dateRange.endDate, 
        token
      );
      
      setTaxSummary(result.data.summary);
    } catch (err) {
      setError('Failed to generate tax summary report. Please try again.');
      toast.error('Failed to generate report');
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="tax-summary bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">GST Tax Summary Report</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleQuickSelect(0)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            This Month
          </button>
          <button
            onClick={() => handleQuickSelect(1)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Last 2 Months
          </button>
          <button
            onClick={() => handleQuickSelect(2)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Last 3 Months
          </button>
          <button
            onClick={() => handleQuickSelect(5)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Last 6 Months
          </button>
        </div>
        
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          {loading ? (
            <span className="inline-block animate-spin mr-2">⟳</span>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          Generate Report
        </button>
      </div>
      
      {taxSummary && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">
            Tax Summary: {format(new Date(dateRange.startDate), 'MMM d, yyyy')} - {format(new Date(dateRange.endDate), 'MMM d, yyyy')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-md font-medium mb-2">Total Sales</h4>
              <p className="text-2xl font-bold">₹{parseFloat(taxSummary.total_sales).toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-md font-medium mb-2">Total Tax Collected</h4>
              <p className="text-2xl font-bold">₹{parseFloat(taxSummary.total_tax).toFixed(2)}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <h4 className="text-md font-medium mb-2">GST Rate Breakdown</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxSummary.by_rate.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.rate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.taxable_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.cgst).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.sgst).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.igst).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.total_tax).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">HSN Code Breakdown</h4>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxSummary.by_hsn.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.hsn_code}</td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.taxable_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.tax_rate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{parseFloat(item.total_tax).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center ml-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              onClick={() => {
                // Placeholder for export to Excel functionality
                toast.info('Export to Excel functionality would be implemented here');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ml-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxSummaryReport; 