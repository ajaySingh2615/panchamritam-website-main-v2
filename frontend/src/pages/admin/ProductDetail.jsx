import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../../services/adminAPI';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(productId);
        setProduct(response.data.product);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 mx-auto">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <Link to="/admin/products" className="text-green-600 hover:text-green-800">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-4 mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>Product not found.</p>
        </div>
        <Link to="/admin/products" className="text-green-600 hover:text-green-800">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Product Details</h1>
        <div className="flex space-x-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Products
          </Link>
          <Link
            to={`/admin/products/${productId}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Edit Product
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto rounded-lg object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-semibold text-gray-900">₹{parseFloat(product.price).toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : product.status === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.status}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-900">{product.category_name || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Stock</p>
                <p className="text-gray-900">{product.quantity} units</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="text-gray-900">{product.sku || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="text-gray-900">{product.brand || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{product.description || 'No description available.'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Shipping</p>
                <p className="text-gray-700 mb-1">
                  {product.free_shipping ? 'Free Shipping' : 'Standard Shipping'}
                </p>
                <p className="text-sm text-gray-600">
                  Delivery: {product.shipping_time || '3-5 business days'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Eco-friendly</p>
                <p className="text-gray-700">
                  {product.eco_friendly ? 'Yes' : 'No'}
                  {product.eco_friendly_details && ` - ${product.eco_friendly_details}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 