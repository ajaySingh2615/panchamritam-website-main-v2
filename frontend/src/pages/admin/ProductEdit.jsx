import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, updateProduct, getAllCategories } from '../../services/adminAPI';

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
    status: 'active'
  });
  
  const [categories, setCategories] = useState([]);
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

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(productId);
        const product = response.data.product;
        
        // Format the data for the form
        setFormData({
          name: product.name || '',
          description: product.description || '',
          short_description: product.short_description || '',
          price: product.price ? product.price.toString() : '',
          regular_price: product.regular_price ? product.regular_price.toString() : '',
          quantity: product.quantity ? product.quantity.toString() : '0',
          categoryId: product.category_id ? product.category_id.toString() : '',
          brand: product.brand || '',
          sku: product.sku || '',
          image_url: product.image_url || '',
          free_shipping: product.free_shipping || false,
          shipping_time: product.shipping_time || '3-5 business days',
          warranty_period: product.warranty_period ? product.warranty_period.toString() : '',
          eco_friendly: product.eco_friendly ?? true,
          eco_friendly_details: product.eco_friendly_details || 'Eco-friendly packaging',
          status: product.status || 'active'
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // For now, just display "Coming Soon" message
  return (
    <div className="container px-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        <Link
          to="/admin/products"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Products
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Edit Form</h2>
            <p className="text-gray-500 mb-2">The full product edit form is coming soon.</p>
            <p className="text-gray-700 mb-6">Product: {formData.name}</p>
            <div className="flex justify-center space-x-4">
              <Link
                to={`/admin/products/${productId}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                View Product
              </Link>
              <Link
                to="/admin/products"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEdit; 