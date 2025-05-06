import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct, getAllCategories, uploadProductImage, uploadGalleryImages, saveVideoUrl } from '../../services/adminAPI';

const ProductCreate = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    slug: '',
    description: '',
    short_description: '',
    categoryId: '',
    subcategory_id: '',
    brand: 'GreenMagic',
    sku: '',
    barcode: '',
    status: 'active',
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: false,
    
    // Pricing & Inventory
    price: '',
    regular_price: '',
    cost_price: '',
    quantity: '0',
    min_stock_alert: '5',
    unit_of_measurement: '',
    package_size: '',
    
    // Product Details
    ingredients: '',
    shelf_life: '',
    storage_instructions: '',
    usage_instructions: '',
    tags: '',
    
    // Images & Media
    image_url: '',
    gallery_images: [],
    video_url: '',
    
    // SEO & Metadata
    meta_title: '',
    meta_description: '',
    
    // Shipping & Availability
    free_shipping: false,
    shipping_time: '3-5 business days',
    warranty_period: '',
    weight_for_shipping: '',
    dimensions: '',
    delivery_time_estimate: '3-5 business days',
    is_returnable: true,
    is_cod_available: true,
    
    // Sustainability
    eco_friendly: true,
    eco_friendly_details: 'Eco-friendly packaging'
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simple validation for image type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (png, jpg, jpeg)');
        return;
      }
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        
        // Store the file in formData
        setFormData({
          ...formData,
          imageFile: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Only select up to 5 files
    const selectedFiles = files.slice(0, 5);
    
    // Validate image types
    const invalidFiles = selectedFiles.filter(file => !file.type.match('image.*'));
    if (invalidFiles.length > 0) {
      setError('All gallery files must be images (png, jpg, jpeg)');
      return;
    }
    
    // Create preview URLs
    const readers = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers)
      .then(previews => {
        setGalleryPreviews(previews);
        setGalleryFiles(selectedFiles);
      });
  };
  
  const removeGalleryImage = (index) => {
    setGalleryPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setGalleryFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name) {
      setError('Product name is required');
      return;
    }
    
    if (!formData.price) {
      setError('Price is required');
      return;
    }
    
    if (!formData.categoryId) {
      setError('Category is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Helper function to convert empty strings to null
      const nullIfEmpty = (value) => value === '' ? null : value;
      
      // Format the data for API
      const productData = {
        ...formData,
        // Convert text fields to null if empty
        slug: nullIfEmpty(formData.slug),
        description: nullIfEmpty(formData.description),
        short_description: nullIfEmpty(formData.short_description),
        ingredients: nullIfEmpty(formData.ingredients),
        shelf_life: nullIfEmpty(formData.shelf_life),
        storage_instructions: nullIfEmpty(formData.storage_instructions),
        usage_instructions: nullIfEmpty(formData.usage_instructions),
        brand: nullIfEmpty(formData.brand),
        sku: nullIfEmpty(formData.sku),
        barcode: nullIfEmpty(formData.barcode),
        unit_of_measurement: nullIfEmpty(formData.unit_of_measurement),
        package_size: nullIfEmpty(formData.package_size),
        video_url: nullIfEmpty(formData.video_url),
        meta_title: nullIfEmpty(formData.meta_title),
        meta_description: nullIfEmpty(formData.meta_description),
        shipping_time: nullIfEmpty(formData.shipping_time),
        dimensions: nullIfEmpty(formData.dimensions),
        delivery_time_estimate: nullIfEmpty(formData.delivery_time_estimate),
        weight_for_shipping: nullIfEmpty(formData.weight_for_shipping),
        eco_friendly_details: nullIfEmpty(formData.eco_friendly_details),
        tags: nullIfEmpty(formData.tags),
        
        // Convert numeric fields to proper number types or null
        price: parseFloat(formData.price),
        regular_price: formData.regular_price ? parseFloat(formData.regular_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        quantity: parseInt(formData.quantity, 10) || 0,
        min_stock_alert: formData.min_stock_alert ? parseInt(formData.min_stock_alert, 10) : null,
        warranty_period: formData.warranty_period ? parseInt(formData.warranty_period, 10) : null,
        categoryId: parseInt(formData.categoryId, 10),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id, 10) : null,
        
        // Boolean fields
        free_shipping: !!formData.free_shipping,
        is_returnable: !!formData.is_returnable,
        is_cod_available: !!formData.is_cod_available,
        eco_friendly: !!formData.eco_friendly,
        is_featured: !!formData.is_featured,
        is_best_seller: !!formData.is_best_seller,
        is_new_arrival: !!formData.is_new_arrival
      };
      
      // Remove the imageFile from the data sent to createProduct
      const { imageFile, ...dataToSend } = productData;
      
      // Create product
      const response = await createProduct(dataToSend);
      const newProductId = response.data.product.productId;
      
      // If we have an image file, upload it
      if (imageFile) {
        await uploadProductImage(newProductId, imageFile);
      }
      
      // If we have gallery files, upload them
      if (galleryFiles && galleryFiles.length > 0) {
        await uploadGalleryImages(newProductId, galleryFiles);
      }
      
      // If we have a video URL that wasn't included in the initial product data
      if (formData.video_url && formData.video_url.trim() !== '') {
        await saveVideoUrl(newProductId, formData.video_url);
      }
      
      setSuccessMessage('Product created successfully!');
      setLoading(false); 
      
      // Use setTimeout to delay the redirect
      setTimeout(() => {
        navigate('/admin/products', { 
          state: { message: 'Product created successfully' } 
        });
      }, 1500);
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product. Please try again.');
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && (!formData.name || !formData.categoryId)) {
      setError('Product name and category are required');
      return;
    }
    
    if (currentStep === 2 && !formData.price) {
      setError('Price is required');
      return;
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Render basic information form (step 1)
  const renderBasicInfoForm = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Enter product name"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Product URL Slug
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Enter URL slug (will be auto-generated if left blank)"
        />
        <p className="mt-1 text-xs text-gray-500">URL-friendly version of the name, e.g. "organic-mustard-oil"</p>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <Link 
            to="/admin/categories"
            className="text-xs text-blue-600 hover:text-blue-800"
            title="Add a new category"
            target="_blank"
            rel="noopener noreferrer"
          >
            + Add New Category
          </Link>
        </div>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700 mb-1">
          Subcategory (optional)
        </label>
        <select
          id="subcategory_id"
          name="subcategory_id"
          value={formData.subcategory_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select a subcategory</option>
          {categories.map(category => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">E.g., Cow Ghee vs. Buffalo Ghee</p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
          Brand
        </label>
        <input
          type="text"
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Enter brand name"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Stock Keeping Unit"
          />
          <p className="mt-1 text-xs text-gray-500">Leave blank to auto-generate</p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
            Barcode / UPC
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Barcode or UPC"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
            Feature on homepage
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_best_seller"
            name="is_best_seller"
            checked={formData.is_best_seller}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="is_best_seller" className="ml-2 block text-sm text-gray-700">
            Mark as Best Seller
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_new_arrival"
            name="is_new_arrival"
            checked={formData.is_new_arrival}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="is_new_arrival" className="ml-2 block text-sm text-gray-700">
            Mark as New Arrival
          </label>
        </div>
      </div>
    </>
  );

  // Render pricing and inventory form (step 2)
  const renderPricingForm = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Pricing & Inventory</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price (₹) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="regular_price" className="block text-sm font-medium text-gray-700 mb-1">
            MRP / Regular Price (₹)
          </label>
          <input
            type="number"
            id="regular_price"
            name="regular_price"
            value={formData.regular_price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <p className="mt-1 text-xs text-gray-500">Set regular price higher than selling price to show discount</p>
        </div>
        
        <div>
          <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price (₹)
          </label>
          <input
            type="number"
            id="cost_price"
            name="cost_price"
            value={formData.cost_price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <p className="mt-1 text-xs text-gray-500">For internal profit tracking (not shown to customers)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label htmlFor="min_stock_alert" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Stock Alert
          </label>
          <input
            type="number"
            id="min_stock_alert"
            name="min_stock_alert"
            value={formData.min_stock_alert}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="5"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Get notified when stock falls below this level</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="unit_of_measurement" className="block text-sm font-medium text-gray-700 mb-1">
            Unit of Measurement
          </label>
          <select
            id="unit_of_measurement"
            name="unit_of_measurement"
            value={formData.unit_of_measurement}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select a unit</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="L">Liters (L)</option>
            <option value="ml">Milliliters (ml)</option>
            <option value="pcs">Pieces (pcs)</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
            <option value="bottle">Bottle</option>
            <option value="jar">Jar</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="package_size" className="block text-sm font-medium text-gray-700 mb-1">
            Package Size / Net Weight
          </label>
          <input
            type="text"
            id="package_size"
            name="package_size"
            value={formData.package_size}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g. 500g, 1L, etc."
          />
        </div>
      </div>
    </>
  );

  // Render product details form (step 3)
  const renderProductDetailsForm = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Product Details</h2>
      
      <div className="mb-4">
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          id="short_description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Enter a short description (max 150 characters)"
          maxLength="150"
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">{formData.short_description.length}/150 characters</p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Full Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Enter detailed product description"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="List of ingredients (especially for food items)"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="shelf_life" className="block text-sm font-medium text-gray-700 mb-1">
            Shelf Life
          </label>
          <input
            type="text"
            id="shelf_life"
            name="shelf_life"
            value={formData.shelf_life}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g. 12 months"
          />
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags / Keywords
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Enter tags separated by commas"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="storage_instructions" className="block text-sm font-medium text-gray-700 mb-1">
          Storage Instructions
        </label>
        <textarea
          id="storage_instructions"
          name="storage_instructions"
          value={formData.storage_instructions}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="e.g. Store in a cool, dry place"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label htmlFor="usage_instructions" className="block text-sm font-medium text-gray-700 mb-1">
          How to Use
        </label>
        <textarea
          id="usage_instructions"
          name="usage_instructions"
          value={formData.usage_instructions}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="Instructions for using this product"
        ></textarea>
      </div>
    </>
  );
  
  // Render shipping and SEO form (step 4)
  const renderShippingAndSeoForm = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipping & SEO Details</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Shipping Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="weight_for_shipping" className="block text-sm font-medium text-gray-700 mb-1">
              Weight for Shipping (kg)
            </label>
            <input
              type="number"
              id="weight_for_shipping"
              name="weight_for_shipping"
              value={formData.weight_for_shipping}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions (L×W×H cm)
            </label>
            <input
              type="text"
              id="dimensions"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. 10x5x2"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="delivery_time_estimate" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Time Estimate
            </label>
            <input
              type="text"
              id="delivery_time_estimate"
              name="delivery_time_estimate"
              value={formData.delivery_time_estimate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. 2-5 business days"
            />
          </div>
          
          <div>
            <label htmlFor="shipping_time" className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Time
            </label>
            <input
              type="text"
              id="shipping_time"
              name="shipping_time"
              value={formData.shipping_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. 3-5 business days"
            />
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="free_shipping"
            name="free_shipping"
            checked={formData.free_shipping}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="free_shipping" className="ml-2 block text-sm text-gray-700">
            Free Shipping
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_returnable"
              name="is_returnable"
              checked={formData.is_returnable}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="is_returnable" className="ml-2 block text-sm text-gray-700">
              Is Returnable
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_cod_available"
              name="is_cod_available"
              checked={formData.is_cod_available}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="is_cod_available" className="ml-2 block text-sm text-gray-700">
              COD Available
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="warranty_period" className="block text-sm font-medium text-gray-700 mb-1">
            Warranty Period (months)
          </label>
          <input
            type="number"
            id="warranty_period"
            name="warranty_period"
            value={formData.warranty_period}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Leave blank if no warranty</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">SEO Information</h3>
        
        <div className="mb-4">
          <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
            Meta Title
          </label>
          <input
            type="text"
            id="meta_title"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="SEO title for the product (default: product name)"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            id="meta_description"
            name="meta_description"
            value={formData.meta_description}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="SEO description for search engines"
          ></textarea>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Eco-Friendly Information</h3>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="eco_friendly"
            name="eco_friendly"
            checked={formData.eco_friendly}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="eco_friendly" className="ml-2 block text-sm text-gray-700">
            Eco-Friendly Product
          </label>
        </div>
        
        <div className={`mb-4 ${!formData.eco_friendly ? 'opacity-50' : ''}`}>
          <label htmlFor="eco_friendly_details" className="block text-sm font-medium text-gray-700 mb-1">
            Eco-Friendly Details
          </label>
          <input
            type="text"
            id="eco_friendly_details"
            name="eco_friendly_details"
            value={formData.eco_friendly_details}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Describe eco-friendly aspects"
            disabled={!formData.eco_friendly}
          />
        </div>
      </div>
    </>
  );

  // Render image upload form (step 5)
  const renderImageForm = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Product Images & Media</h2>
      
      <div className="mb-6">
        <label htmlFor="main_image" className="block text-sm font-medium text-gray-700 mb-2">
          Main Product Image
        </label>
        <div className="flex items-center justify-center">
          <label className="flex flex-col items-center px-4 py-6 bg-white text-green-600 rounded-lg border-2 border-dashed border-green-400 hover:bg-green-50 cursor-pointer transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-2 text-base leading-normal">Upload main image</span>
            <input 
              type="file" 
              id="product_image" 
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
      
      {previewImage && (
        <div className="mt-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="flex justify-center">
            <img 
              src={previewImage} 
              alt="Product preview" 
              className="max-h-64 rounded-lg shadow-md" 
            />
          </div>
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() => {
                setPreviewImage(null);
                setFormData({...formData, imageFile: null});
              }}
              className="text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <label htmlFor="image_url_direct" className="block text-sm font-medium text-gray-700 mb-2">
          Or enter an image URL directly
        </label>
        <input
          type="text"
          id="image_url_direct"
          name="image_url"
          value={!previewImage ? formData.image_url : ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="https://example.com/image.jpg"
          disabled={!!previewImage}
        />
        <p className="mt-1 text-xs text-gray-500">Use this if you have an image hosted elsewhere</p>
      </div>
      
      <div className="mt-8 mb-6">
        <label htmlFor="gallery_images" className="block text-sm font-medium text-gray-700 mb-2">
          Gallery Images (Max 5)
        </label>
        <div className="flex flex-col items-center">
          <label className="flex flex-col items-center px-4 py-6 bg-white text-green-600 rounded-lg border-2 border-dashed border-green-400 hover:bg-green-50 cursor-pointer transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-2 text-base leading-normal">Upload gallery images</span>
            <input 
              type="file" 
              id="gallery_images" 
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryImagesChange}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">You can select up to 5 images</p>
        </div>
        
        {galleryPreviews.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Gallery previews:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview} 
                    alt={`Gallery image ${index + 1}`} 
                    className="h-24 w-24 object-cover rounded-lg shadow-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
          Product Video URL
        </label>
        <input
          type="text"
          id="video_url"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          placeholder="e.g. https://youtube.com/watch?v=xxxxx or https://vimeo.com/xxxxx"
        />
        <p className="mt-1 text-xs text-gray-500">Product demo or promotional video</p>
      </div>
    </>
  );

  // Render review and submit form (step 6)
  const renderReviewForm = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Review & Submit</h2>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <p className="text-green-800 font-medium">You're almost done! Please review the product details below before submitting.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 border-b pb-2 mb-2">Basic Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {formData.name}</p>
            <p><span className="font-medium">Category:</span> {categories.find(c => c.category_id.toString() === formData.categoryId.toString())?.name || 'Not selected'}</p>
            <p><span className="font-medium">Brand:</span> {formData.brand || 'Not specified'}</p>
            <p><span className="font-medium">Status:</span> {formData.status}</p>
            <p><span className="font-medium">Featured:</span> {formData.is_featured ? 'Yes' : 'No'}</p>
          </div>
          
          <h3 className="font-medium text-gray-700 border-b pb-2 mt-4 mb-2">Pricing & Inventory</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Price:</span> ₹{formData.price}</p>
            {formData.regular_price && <p><span className="font-medium">Regular Price:</span> ₹{formData.regular_price}</p>}
            <p><span className="font-medium">SKU:</span> {formData.sku || 'Auto-generated'}</p>
            <p><span className="font-medium">Stock:</span> {formData.quantity}</p>
            {formData.tags && <p><span className="font-medium">Tags:</span> {formData.tags}</p>}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 border-b pb-2 mb-2">Shipping & Additional Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Free Shipping:</span> {formData.free_shipping ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Shipping Time:</span> {formData.shipping_time}</p>
            {formData.warranty_period && <p><span className="font-medium">Warranty:</span> {formData.warranty_period} months</p>}
            <p><span className="font-medium">Eco-Friendly:</span> {formData.eco_friendly ? 'Yes' : 'No'}</p>
            {formData.eco_friendly && <p><span className="font-medium">Eco-Friendly Details:</span> {formData.eco_friendly_details}</p>}
          </div>
          
          {(previewImage || formData.image_url) && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 border-b pb-2 mb-2">Product Image</h3>
              {previewImage ? (
                <div>
                  <img src={previewImage} alt="Product preview" className="max-h-40 rounded-lg mt-2" />
                  <p className="text-sm text-gray-600 mt-1">Image will be uploaded after submission</p>
                </div>
              ) : (
                <p>{formData.image_url}</p>
              )}
            </div>
          )}
          
          {formData.description && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 border-b pb-2 mb-2">Description</h3>
              <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Render the current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoForm();
      case 2:
        return renderPricingForm();
      case 3:
        return renderProductDetailsForm();
      case 4:
        return renderShippingAndSeoForm();
      case 5:
        return renderImageForm();
      case 6:
        return renderReviewForm();
      default:
        return renderBasicInfoForm();
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, name: 'Basic Info' },
      { number: 2, name: 'Pricing' },
      { number: 3, name: 'Details' },
      { number: 4, name: 'Shipping & SEO' },
      { number: 5, name: 'Images' },
      { number: 6, name: 'Review' }
    ];

    return (
      <div className="mb-8">
        <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
          {steps.map(step => (
            <li key={step.number} className={`flex md:w-full items-center ${currentStep === step.number ? 'text-green-600 dark:text-green-500' : ''} ${currentStep > step.number ? 'text-green-600 dark:text-green-500' : ''}`}>
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs border border-gray-300 rounded-full shrink-0 dark:border-gray-400 sm:w-8 sm:h-8 sm:text-sm">
                {currentStep > step.number ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </span>
              <span className="hidden sm:inline-flex sm:ml-2">{step.name}</span>
              {step.number < steps.length && (
                <svg className="w-4 h-4 ml-2 sm:ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div className="container px-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Create New Product</h1>
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
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {renderStepIndicator()}
        
        {currentStep < 6 ? (
          <div>
            {renderStepForm()}
            
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
              
              <div className="flex justify-end">
                <Link
                  to="/admin/products"
                  className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </Link>
                
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {renderStepForm()}
            
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex justify-end">
                <Link
                  to="/admin/products"
                  className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductCreate; 