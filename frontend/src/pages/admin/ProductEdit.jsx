import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, updateProduct, getAllCategories } from '../../services/adminAPI';
import TaxService from '../../services/taxService';
import { toast } from 'react-toastify';

const ProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    regular_price: '',
    quantity: '0',
    categoryId: '',
    brand: '',
    sku: '',
    image_url: '',
    free_shipping: false,
    shipping_time: '3-5 business days',
    warranty_period: '',
    eco_friendly: true,
    eco_friendly_details: 'Eco-friendly packaging',
    status: 'active',
    // Tax-related fields
    hsn_code_id: '',
    is_branded: false,
    is_packaged: false,
    custom_gst_rate_id: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [gstRates, setGstRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchHsnCodes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await TaxService.getAllHSNCodes(1, 100, token);
        setHsnCodes(response.data.codes || []);
      } catch (err) {
        console.error('Error fetching HSN codes:', err);
      }
    };

    const fetchGstRates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await TaxService.getAllGSTRates(token);
        setGstRates(response.data.rates || []);
      } catch (err) {
        console.error('Error fetching GST rates:', err);
      }
    };

    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await getProduct(productId);
        const product = response.data.product;
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          short_description: product.short_description || '',
          price: product.price || '',
          regular_price: product.regular_price || '',
          quantity: product.quantity || '0',
          categoryId: product.category_id || '',
          brand: product.brand || '',
          sku: product.sku || '',
          image_url: product.image_url || '',
          free_shipping: product.free_shipping || false,
          shipping_time: product.shipping_time || '3-5 business days',
          warranty_period: product.warranty_period || '',
          eco_friendly: product.eco_friendly || true,
          eco_friendly_details: product.eco_friendly_details || 'Eco-friendly packaging',
          status: product.status || 'active',
          // Tax-related fields
          hsn_code_id: product.hsn_code_id || '',
          is_branded: product.is_branded || false,
          is_packaged: product.is_packaged || false,
          custom_gst_rate_id: product.custom_gst_rate_id || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data');
        setLoading(false);
      }
    };

    fetchCategories();
    fetchHsnCodes();
    fetchGstRates();
    if (productId) {
      fetchProductData();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Create a copy of formData to modify before submission
    const submissionData = { ...formData };
    
    // Handle empty numeric fields that require integers/numbers in the database
    const numericFields = ['warranty_period', 'quantity', 'custom_gst_rate_id', 'hsn_code_id'];
    numericFields.forEach(field => {
      if (submissionData[field] === '') {
        submissionData[field] = null;
      }
    });
    
    // Ensure price and regular_price are valid numbers
    if (submissionData.price === '') submissionData.price = 0;
    if (submissionData.regular_price === '') submissionData.regular_price = null;
    
    // Separate tax-related attributes from general product data
    const taxAttributes = {
      hsn_code_id: submissionData.hsn_code_id,
      is_branded: submissionData.is_branded,
      is_packaged: submissionData.is_packaged,
      custom_gst_rate_id: submissionData.custom_gst_rate_id
    };
    
    // Remove tax attributes from the general product data
    delete submissionData.hsn_code_id;
    delete submissionData.is_branded;
    delete submissionData.is_packaged;
    delete submissionData.custom_gst_rate_id;
    
    try {
      // Update general product information
      await updateProduct(productId, submissionData);
      
      // Update tax attributes using the taxService
      const token = localStorage.getItem('token');
      await TaxService.updateProductTaxAttributes(productId, taxAttributes, token);
      
      toast.success('Product updated successfully');
      setSaving(false);
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link to="/admin/products" className="text-indigo-600 hover:text-indigo-800">
          Back to Products
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tax Information */}
          <div className="col-span-2 mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Tax Information</h2>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">HSN Code</label>
            <select
              name="hsn_code_id"
              value={formData.hsn_code_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select HSN Code</option>
              {hsnCodes.map(code => (
                <option key={code.hsn_id} value={code.hsn_id}>
                  {code.code} {code.description ? `- ${code.description}` : ''} 
                  {code.rate_name ? ` (GST: ${code.percentage}%)` : ''}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              HSN code determines the applicable GST rate for this product
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Custom GST Rate (Optional)</label>
            <select
              name="custom_gst_rate_id"
              value={formData.custom_gst_rate_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Use HSN Code's Default Rate</option>
              {gstRates.map(rate => (
                <option key={rate.rate_id} value={rate.rate_id}>
                  {rate.rate_name} ({rate.percentage}%)
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Override the default GST rate from HSN code if needed
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_branded"
                  checked={formData.is_branded}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Branded</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_packaged"
                  checked={formData.is_packaged}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Packaged</span>
              </label>
            </div>
          </div>
          
          <div className="col-span-2 text-sm text-gray-600">
            Note: 'Branded' and 'Packaged' status may affect applicable tax rates for certain product categories.
          </div>
          
          {/* Pricing */}
          <div className="col-span-2 mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Regular Price (₹)</label>
            <input
              type="number"
              name="regular_price"
              value={formData.regular_price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Quantity in Stock</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          
          {/* More fields can be added but keeping it simple for now */}
          
          <div className="col-span-2 mt-6">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit; 