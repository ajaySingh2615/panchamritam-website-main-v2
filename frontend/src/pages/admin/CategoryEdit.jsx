import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategory, updateCategory } from '../../services/adminAPI';

const CategoryEdit = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await getCategory(categoryId);
        const category = response.data.category;
        
        setName(category.name);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category. Please try again.');
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await updateCategory(categoryId, { name: name.trim() });
      
      navigate('/admin/categories', { 
        state: { message: 'Category updated successfully' } 
      });
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Category</h1>
        <Link
          to="/admin/categories"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Categories
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              to="/admin/categories"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit; 