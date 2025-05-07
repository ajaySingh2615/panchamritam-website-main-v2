const Product = require('../models/product');
const Category = require('../models/category');
const { AppError } = require('../middlewares/errorHandler');
const { uploadImage, uploadMultipleImages } = require('../config/cloudinary');
const fs = require('fs');

// Get all products with pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    let products;
    
    // Check if category filter is applied
    if (req.query.category) {
      const categoryId = req.query.category;
      
      // Verify category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new AppError('Category not found', 404));
      }
      
      // Get products filtered by category
      products = await Product.findByCategory(categoryId, limit, offset);
    } else {
      // Get all products without category filter
      products = await Product.findAll(limit, offset);
    }
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit
      },
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Product controller getProductById called with ID:', id);
    
    // Validate ID
    if (!id) {
      console.error('No product ID provided in request params');
      return next(new AppError('Product ID is required', 400));
    }
    
    const product = await Product.findById(id);
    console.log('Product lookup result:', product ? 'Found' : 'Not found');
    
    if (!product) {
      console.error('Product not found for ID:', id);
      return next(new AppError('Product not found', 404));
    }
    
    // Log the product being returned
    console.log('Returning product with ID:', product.product_id);
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error in getProductById controller:', error);
    next(error);
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    const products = await Product.findByCategory(categoryId, limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit
      },
      data: {
        category,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const { 
      name, 
      slug,
      description,
      short_description,
      ingredients,
      shelf_life,
      storage_instructions,
      usage_instructions,
      price, 
      regular_price,
      cost_price,
      quantity, 
      min_stock_alert,
      unit_of_measurement,
      package_size,
      categoryId, 
      subcategory_id,
      brand,
      sku,
      barcode,
      imageUrl,
      gallery_images,
      video_url,
      meta_title,
      meta_description,
      free_shipping,
      shipping_time,
      warranty_period,
      weight_for_shipping,
      dimensions,
      delivery_time_estimate,
      is_returnable,
      is_cod_available,
      eco_friendly,
      eco_friendly_details,
      tags,
      is_featured,
      is_best_seller,
      is_new_arrival,
      status
    } = req.body;
    
    // Basic validation
    if (!name || !price || !categoryId) {
      return next(new AppError('Name, price, and category ID are required', 400));
    }
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    // Check if subcategory exists if provided
    if (subcategory_id) {
      const subcategory = await Category.findById(subcategory_id);
      if (!subcategory) {
        return next(new AppError('Subcategory not found', 404));
      }
    }
    
    // Check if SKU exists
    if (sku) {
      const existingSku = await Product.findBySku(sku);
      if (existingSku) {
        return next(new AppError('SKU already exists', 400));
      }
    }
    
    // Check if slug exists
    if (slug) {
      const existingProductWithSlug = await Product.findBySlug(slug);
      if (existingProductWithSlug) {
        return next(new AppError('URL slug already exists', 400));
      }
    }
    
    // Create product with all fields
    const newProduct = await Product.create({
      name,
      slug,
      description,
      short_description,
      ingredients,
      shelf_life,
      storage_instructions,
      usage_instructions,
      price,
      regular_price: regular_price || price,
      cost_price,
      quantity: quantity || 0,
      min_stock_alert,
      unit_of_measurement,
      package_size,
      categoryId,
      subcategory_id,
      brand: brand || 'GreenMagic',
      sku: sku || `GM-${Date.now()}`,
      barcode,
      imageUrl: imageUrl || null,
      gallery_images,
      video_url,
      meta_title,
      meta_description,
      free_shipping: free_shipping || false,
      shipping_time: shipping_time || '3-5 business days',
      warranty_period: warranty_period || null,
      weight_for_shipping,
      dimensions,
      delivery_time_estimate,
      is_returnable,
      is_cod_available,
      eco_friendly: eco_friendly !== undefined ? eco_friendly : true,
      eco_friendly_details: eco_friendly_details || 'Eco-friendly packaging',
      tags: tags || '',
      is_featured: is_featured || false,
      is_best_seller: is_best_seller || false,
      is_new_arrival: is_new_arrival || false,
      status: status || 'active',
      createdBy: req.user.user_id
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        product: {
          ...newProduct,
          category_name: category.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      slug,
      description, 
      short_description,
      ingredients,
      shelf_life,
      storage_instructions,
      usage_instructions,
      price, 
      regular_price,
      cost_price,
      quantity, 
      min_stock_alert,
      unit_of_measurement,
      package_size,
      categoryId, 
      subcategory_id,
      brand,
      sku,
      barcode,
      imageUrl,
      gallery_images,
      video_url,
      meta_title,
      meta_description,
      free_shipping,
      shipping_time,
      warranty_period,
      weight_for_shipping,
      dimensions,
      delivery_time_estimate,
      is_returnable,
      is_cod_available,
      eco_friendly,
      eco_friendly_details,
      rating,
      review_count,
      tags,
      is_featured,
      is_best_seller,
      is_new_arrival,
      status
    } = req.body;
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    // Check if category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new AppError('Category not found', 404));
      }
    }
    
    // If updating SKU, check it doesn't conflict
    if (sku && sku !== product.sku) {
      const existingSku = await Product.findBySku(sku);
      if (existingSku && existingSku.product_id !== parseInt(id)) {
        return next(new AppError('SKU already exists', 400));
      }
    }
    
    // If updating slug, check it doesn't conflict
    if (slug && slug !== product.slug) {
      const existingSlug = await Product.findBySlug(slug);
      if (existingSlug && existingSlug.product_id !== parseInt(id)) {
        return next(new AppError('URL slug already exists', 400));
      }
    }
    
    // Prepare update data with all fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (short_description !== undefined) updateData.short_description = short_description;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (shelf_life !== undefined) updateData.shelf_life = shelf_life;
    if (storage_instructions !== undefined) updateData.storage_instructions = storage_instructions;
    if (usage_instructions !== undefined) updateData.usage_instructions = usage_instructions;
    if (price !== undefined) updateData.price = price;
    if (regular_price !== undefined) updateData.regular_price = regular_price;
    if (cost_price !== undefined) updateData.cost_price = cost_price;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (min_stock_alert !== undefined) updateData.min_stock_alert = min_stock_alert;
    if (unit_of_measurement !== undefined) updateData.unit_of_measurement = unit_of_measurement;
    if (package_size !== undefined) updateData.package_size = package_size;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (subcategory_id !== undefined) updateData.subcategory_id = subcategory_id;
    if (brand !== undefined) updateData.brand = brand;
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (gallery_images !== undefined) updateData.gallery_images = gallery_images;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (free_shipping !== undefined) updateData.free_shipping = free_shipping;
    if (shipping_time !== undefined) updateData.shipping_time = shipping_time;
    if (warranty_period !== undefined) updateData.warranty_period = warranty_period;
    if (weight_for_shipping !== undefined) updateData.weight_for_shipping = weight_for_shipping;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (delivery_time_estimate !== undefined) updateData.delivery_time_estimate = delivery_time_estimate;
    if (is_returnable !== undefined) updateData.is_returnable = is_returnable;
    if (is_cod_available !== undefined) updateData.is_cod_available = is_cod_available;
    if (eco_friendly !== undefined) updateData.eco_friendly = eco_friendly;
    if (eco_friendly_details !== undefined) updateData.eco_friendly_details = eco_friendly_details;
    if (rating !== undefined) updateData.rating = rating;
    if (review_count !== undefined) updateData.review_count = review_count;
    if (tags !== undefined) updateData.tags = tags;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_best_seller !== undefined) updateData.is_best_seller = is_best_seller;
    if (is_new_arrival !== undefined) updateData.is_new_arrival = is_new_arrival;
    if (status !== undefined) updateData.status = status;
    
    // Update product
    const updatedProduct = await Product.update(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.delete(id);
    
    if (!deleted) {
      return next(new AppError('Product not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.message.includes('Cannot delete product')) {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
};

// Search products
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return next(new AppError('Search query is required', 400));
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const products = await Product.search(q, limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit
      },
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get related products
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Fetching related products for product ID:', id);
    
    // DEBUG: Get all products to see what we have in the database
    try {
      const allProducts = await Product.findAll(100, 0); // Get up to 100 products
      console.log('DEBUG - All products in database:', allProducts.map(p => ({
        id: p.product_id,
        name: p.name,
        category_id: p.category_id
      })));
    } catch (debugError) {
      console.error('Debug error fetching all products:', debugError);
    }
    
    // Get the current product to find its category
    const product = await Product.findById(id);
    
    if (!product) {
      console.error('Current product not found with ID:', id);
      return next(new AppError('Product not found', 404));
    }
    
    console.log('Current product details:', {
      id: product.product_id,
      name: product.name,
      category_id: product.category_id
    });
    
    // Get products from the same category, excluding the current product
    const limit = parseInt(req.query.limit) || 4; // Default to 4 related products
    const categoryId = product.category_id;
    
    if (!categoryId) {
      console.error('No category ID found for product:', id);
      return next(new AppError('Product has no category', 400));
    }
    
    console.log('Fetching related products from category:', categoryId);
    
    // Get all products from this category
    const allCategoryProducts = await Product.findByCategory(categoryId, 20, 0);
    console.log(`Found ${allCategoryProducts.length} products in category ${categoryId}`);
    
    if (allCategoryProducts.length === 0) {
      console.log('No products found in this category');
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          products: []
        }
      });
    }
    
    // Log all products in the category for debugging
    console.log('Category products:', allCategoryProducts.map(p => ({
      id: p.product_id,
      name: p.name,
      currentProduct: p.product_id === parseInt(id)
    })));
    
    // Filter out the current product and limit the results
    const relatedProducts = allCategoryProducts
      .filter(p => p.product_id !== parseInt(id))
      .slice(0, limit);
    
    console.log(`Found ${relatedProducts.length} related products after filtering`);
    console.log('Related products:', relatedProducts.map(p => ({
      id: p.product_id, 
      name: p.name
    })));
    
    res.status(200).json({
      status: 'success',
      results: relatedProducts.length,
      data: {
        products: relatedProducts
      }
    });
  } catch (error) {
    console.error('Error in getRelatedProducts controller:', error);
    next(error);
  }
};

// Upload product main image
exports.uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      // Delete uploaded file if product doesn't exist
      if (req.file) fs.unlinkSync(req.file.path);
      return next(new AppError('Product not found', 404));
    }
    
    // No file was uploaded
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }
    
    // Upload image to Cloudinary
    const result = await uploadImage(req.file.path);
    
    // Remove the temporary file
    fs.unlinkSync(req.file.path);
    
    // Update product with new image URL
    const updateData = {
      imageUrl: result.secure_url
    };
    
    // Update product
    const updatedProduct = await Product.update(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        imageUrl: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    // Clean up temporary file in case of error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// Upload product gallery images
exports.uploadGalleryImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      // Delete uploaded files if product doesn't exist
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      return next(new AppError('Product not found', 404));
    }
    
    // No files were uploaded
    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload at least one image file', 400));
    }
    
    // Upload images to Cloudinary
    const uploadPromises = req.files.map(file => uploadImage(file.path));
    const results = await Promise.all(uploadPromises);
    
    // Remove the temporary files
    req.files.forEach(file => fs.unlinkSync(file.path));
    
    // Extract image URLs
    const galleryImages = results.map(result => ({
      url: result.secure_url,
      public_id: result.public_id
    }));
    
    // Get existing gallery images if any
    let existingGallery = [];
    if (product.gallery_images) {
      try {
        existingGallery = JSON.parse(product.gallery_images);
        if (!Array.isArray(existingGallery)) existingGallery = [];
      } catch (e) {
        existingGallery = [];
      }
    }
    
    // Combine existing and new gallery images
    const combinedGallery = [...existingGallery, ...galleryImages];
    
    // Update product with new gallery images
    const updateData = {
      gallery_images: JSON.stringify(combinedGallery)
    };
    
    // Update product
    const updatedProduct = await Product.update(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        gallery_images: combinedGallery
      }
    });
  } catch (error) {
    // Clean up temporary files in case of error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

// Save video URL for product
exports.saveVideoUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { video_url } = req.body;
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    // Validate video URL
    if (!video_url) {
      return next(new AppError('Video URL is required', 400));
    }
    
    // Update product with video URL
    const updateData = {
      video_url
    };
    
    // Update product
    const updatedProduct = await Product.update(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        video_url
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get tax information for a product
exports.getProductTaxInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const taxInfo = await Product.getTaxInfo(id);
    
    if (!taxInfo) {
      return next(new AppError('Product not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        tax_info: taxInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update product tax attributes
exports.updateProductTaxAttributes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hsn_code_id, is_branded, is_packaged, custom_gst_rate_id } = req.body;
    
    // Validate input
    if (hsn_code_id === undefined && is_branded === undefined && 
        is_packaged === undefined && custom_gst_rate_id === undefined) {
      return next(new AppError('No tax attributes provided for update', 400));
    }
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    const taxData = {
      hsn_code_id: hsn_code_id,
      is_branded: is_branded,
      is_packaged: is_packaged,
      custom_gst_rate_id: custom_gst_rate_id
    };
    
    const updatedTaxInfo = await Product.updateTaxAttributes(id, taxData);
    
    res.status(200).json({
      status: 'success',
      message: 'Product tax attributes updated successfully',
      data: {
        tax_info: updatedTaxInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update product tax attributes
exports.bulkUpdateProductTaxAttributes = async (req, res, next) => {
  try {
    const { product_ids, tax_attributes } = req.body;
    
    // Validate input
    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return next(new AppError('Product IDs array is required', 400));
    }
    
    if (!tax_attributes || Object.keys(tax_attributes).length === 0) {
      return next(new AppError('Tax attributes are required', 400));
    }
    
    const result = await Product.bulkUpdateTaxAttributes(product_ids, tax_attributes);
    
    res.status(200).json({
      status: 'success',
      message: `Tax attributes updated for ${result.updated} out of ${result.total} products`,
      data: {
        result
      }
    });
  } catch (error) {
    next(error);
  }
};

// Calculate product price with tax
exports.calculatePriceWithTax = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.query;
    
    // Validate input
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return next(new AppError('Quantity must be a positive number', 400));
    }
    
    const calculation = await Product.calculatePriceWithTax(id, parsedQuantity);
    
    res.status(200).json({
      status: 'success',
      data: {
        calculation
      }
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return next(new AppError('Product not found', 404));
    }
    next(error);
  }
}; 