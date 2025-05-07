import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TaxService from '../../services/taxService';
import Tabs from '../../components/common/Tabs';
import { toast } from 'react-toastify';

// GST Rates Management Component
const GSTRatesManagement = () => {
  const { user, token } = useAuth();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRate, setNewRate] = useState({ rate_name: '', percentage: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [currentRateId, setCurrentRateId] = useState(null);

  // Fetch all GST rates
  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await TaxService.getAllGSTRates(token);
      setRates(response.data.rates);
    } catch (error) {
      toast.error('Failed to load GST rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRates();
    }
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRate(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission for creating or updating a rate
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!newRate.rate_name || !newRate.percentage) {
      toast.error('Rate name and percentage are required');
      return;
    }
    
    setLoading(true);
    try {
      if (editMode) {
        // Update existing rate
        await TaxService.updateGSTRate(currentRateId, newRate, token);
        toast.success('GST rate updated successfully');
      } else {
        // Create new rate
        await TaxService.createGSTRate(newRate, token);
        toast.success('GST rate created successfully');
      }
      
      // Reset form and refresh rates
      setNewRate({ rate_name: '', percentage: '', description: '' });
      setEditMode(false);
      setCurrentRateId(null);
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save GST rate');
    } finally {
      setLoading(false);
    }
  };

  // Edit a rate
  const handleEdit = (rate) => {
    setNewRate({
      rate_name: rate.rate_name,
      percentage: rate.percentage,
      description: rate.description || ''
    });
    setEditMode(true);
    setCurrentRateId(rate.rate_id);
  };

  // Delete a rate
  const handleDelete = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this GST rate?')) {
      return;
    }
    
    setLoading(true);
    try {
      await TaxService.deleteGSTRate(rateId, token);
      toast.success('GST rate deleted successfully');
      fetchRates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete GST rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">GST Rates Management</h2>
      
      {/* GST Rate Form */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium mb-4">{editMode ? 'Edit GST Rate' : 'Add New GST Rate'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Name *</label>
              <input
                type="text"
                name="rate_name"
                value={newRate.rate_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Standard, Reduced"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%) *</label>
              <input
                type="number"
                name="percentage"
                value={newRate.percentage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 5, 12, 18"
                min="0"
                max="28"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={newRate.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional description for this GST rate"
              rows="2"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : editMode ? 'Update Rate' : 'Add Rate'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setNewRate({ rate_name: '', percentage: '', description: '' });
                  setEditMode(false);
                  setCurrentRateId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* GST Rates Table */}
      <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">Existing GST Rates</h3>
        {loading && <p className="text-gray-500">Loading rates...</p>}
        {!loading && rates.length === 0 && (
          <p className="text-gray-500">No GST rates found. Add your first one above.</p>
        )}
        {!loading && rates.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rates.map(rate => (
                <tr key={rate.rate_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{rate.rate_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{rate.percentage}%</td>
                  <td className="px-6 py-4">{rate.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(rate)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rate.rate_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// HSN Codes Management Component
const HSNCodesManagement = () => {
  const { user, token } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCode, setNewCode] = useState({ code: '', description: '', default_gst_rate_id: '' });
  const [gstRates, setGstRates] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentCodeId, setCurrentCodeId] = useState(null);

  // Fetch HSN codes
  const fetchCodes = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await TaxService.getAllHSNCodes(pageNum, 20, token);
      setCodes(response.data.codes);
      setHasMore(response.data.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load HSN codes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch GST rates for dropdown
  const fetchGSTRates = async () => {
    try {
      const response = await TaxService.getAllGSTRates(token);
      setGstRates(response.data.rates);
    } catch (error) {
      toast.error('Failed to load GST rates');
    }
  };

  useEffect(() => {
    if (token) {
      fetchCodes();
      fetchGSTRates();
    }
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCode(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!newCode.code) {
      toast.error('HSN code is required');
      return;
    }
    
    setLoading(true);
    try {
      if (editMode) {
        // Update existing code
        await TaxService.updateHSNCode(currentCodeId, newCode, token);
        toast.success('HSN code updated successfully');
      } else {
        // Create new code
        await TaxService.createHSNCode(newCode, token);
        toast.success('HSN code created successfully');
      }
      
      // Reset form and refresh codes
      setNewCode({ code: '', description: '', default_gst_rate_id: '' });
      setEditMode(false);
      setCurrentCodeId(null);
      fetchCodes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save HSN code');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCodes();
      return;
    }
    
    setLoading(true);
    try {
      const response = await TaxService.searchHSNCodes(searchQuery, token);
      setCodes(response.data.codes);
      setHasMore(false); // Search results don't have pagination for simplicity
    } catch (error) {
      toast.error('Failed to search HSN codes');
    } finally {
      setLoading(false);
    }
  };

  // Edit a code
  const handleEdit = (code) => {
    setNewCode({
      code: code.code,
      description: code.description || '',
      default_gst_rate_id: code.default_gst_rate_id || ''
    });
    setEditMode(true);
    setCurrentCodeId(code.hsn_id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">HSN Codes Management</h2>
      
      {/* HSN Code Form */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium mb-4">{editMode ? 'Edit HSN Code' : 'Add New HSN Code'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
              <input
                type="text"
                name="code"
                value={newCode.code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 1234"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default GST Rate</label>
              <select
                name="default_gst_rate_id"
                value={newCode.default_gst_rate_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">None</option>
                {gstRates.map(rate => (
                  <option key={rate.rate_id} value={rate.rate_id}>
                    {rate.rate_name} ({rate.percentage}%)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={newCode.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : editMode ? 'Update Code' : 'Add Code'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setNewCode({ code: '', description: '', default_gst_rate_id: '' });
                  setEditMode(false);
                  setCurrentCodeId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Search */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Search HSN codes..."
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchCodes();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* HSN Codes Table */}
      <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">HSN Codes</h3>
        {loading && <p className="text-gray-500">Loading codes...</p>}
        {!loading && codes.length === 0 && (
          <p className="text-gray-500">No HSN codes found. Add your first one above.</p>
        )}
        {!loading && codes.length > 0 && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default GST Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codes.map(code => (
                  <tr key={code.hsn_id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{code.code}</td>
                    <td className="px-6 py-4">{code.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {code.rate_name ? `${code.rate_name} (${code.percentage}%)` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(code)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {!searchQuery && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => fetchCodes(page - 1)}
                  disabled={page === 1 || loading}
                  className={`px-3 py-1 rounded-md ${
                    page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <button
                  onClick={() => fetchCodes(page + 1)}
                  disabled={!hasMore || loading}
                  className={`px-3 py-1 rounded-md ${
                    !hasMore ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Main Tax Management Component
const TaxManagement = () => {
  const [activeTab, setActiveTab] = useState('gst');
  
  const tabs = [
    { id: 'gst', label: 'GST Rates' },
    { id: 'hsn', label: 'HSN Codes' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tax Management</h1>
      
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <div className="mt-6">
        {activeTab === 'gst' && <GSTRatesManagement />}
        {activeTab === 'hsn' && <HSNCodesManagement />}
      </div>
    </div>
  );
};

export default TaxManagement; 