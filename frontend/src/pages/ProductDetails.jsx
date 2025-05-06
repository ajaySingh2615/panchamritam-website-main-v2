import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Breadcrumb from '../components/common/Breadcrumb';
import { API_ENDPOINTS } from '../config/api';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cart, updateCartItemQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const imageRef = useRef(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  // Utility functions for displaying product info
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };
  
  const calculateDiscount = () => {
    if (!product || !product.regular_price || product.regular_price <= product.price) {
      return 0;
    }
    
    const discount = product.regular_price - product.price;
    const discountPercentage = (discount / product.regular_price) * 100;
    
    return Math.round(discountPercentage);
  };
  
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fillOpacity="0.5"></path>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
          </svg>
        );
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-gray-600">{rating ? `${rating.toFixed(1)}/5` : 'No ratings yet'}</span>
      </div>
    );
  };

  // Check if product is in cart
  useEffect(() => {
    if (product && cart && cart.length > 0) {
      console.log('Checking if product is in cart:', {
        productId: product.product_id,
        cart: cart
      });
      
      // Use more reliable comparison (by ID) to find the product in cart
      const cartItem = cart.find(item => {
        // Get all possible IDs from the product
        const productId = parseInt(product.product_id);
        const itemProductId = item.product_id ? parseInt(item.product_id) : null;
        const itemId = item.id ? parseInt(item.id) : null;
        
        // Compare with all possible IDs from the cart item
        return productId === itemProductId || productId === itemId;
      });
      
      if (cartItem) {
        console.log('Found product in cart:', cartItem);
        setIsInCart(true);
        setCartQuantity(cartItem.quantity);
        // Update the quantity input to match cart quantity
        setQuantity(cartItem.quantity);
      } else {
        console.log('Product not found in cart');
        setIsInCart(false);
        setCartQuantity(0);
        // Reset quantity to 1 when not in cart
        setQuantity(1);
      }
    } else {
      // Reset states when cart is empty
      setIsInCart(false);
      setCartQuantity(0);
      setQuantity(1);
    }
  }, [product, cart]);

  // Quantity handlers
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.quantity - cartQuantity + (isInCart ? cartQuantity : 0))) {
      setQuantity(value);
      
      // If already in cart, update the cart quantity directly
      if (isInCart) {
        updateCartItemQuantity(parseInt(product.product_id), value);
        setCartQuantity(value);
      }
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.quantity - cartQuantity + (isInCart ? cartQuantity : 0))) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      
      // If already in cart, update the cart quantity directly
      if (isInCart) {
        updateCartItemQuantity(parseInt(product.product_id), newQuantity);
        setCartQuantity(newQuantity);
      }
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      
      // If already in cart, update the cart quantity directly
      if (isInCart) {
        updateCartItemQuantity(parseInt(product.product_id), newQuantity);
        setCartQuantity(newQuantity);
      }
    } else if (quantity === 1 && isInCart) {
      // Remove from cart if decreasing from 1
      handleRemoveFromCart();
    }
  };

  // Cart handlers
  const handleAddToCart = () => {
    if (product && product.quantity > 0) {
      // Create a consistent product object for the cart
      const productToAdd = {
        ...product,
        product_id: parseInt(product.product_id),
        id: parseInt(product.product_id), // Add id field for consistency
        cartQuantity: quantity // Use cartQuantity to distinguish from stock quantity
      };
      
      addToCart(productToAdd);
      setIsInCart(true);
      setCartQuantity(quantity);
    }
  };

  const handleRemoveFromCart = () => {
    if (product) {
      // Pass both possible ID formats to ensure removal works
      removeFromCart(parseInt(product.product_id));
      setIsInCart(false);
      setCartQuantity(0);
      setQuantity(1); // Reset to 1 for potential new addition
    }
  };

  const handleBuyNow = () => {
    if (product && product.quantity > 0) {
      // Create a consistent product object for the cart
      const productToAdd = {
        ...product,
        product_id: parseInt(product.product_id),
        id: parseInt(product.product_id), // Add id field for consistency
        cartQuantity: quantity // Use cartQuantity to distinguish from stock quantity
      };
      
      addToCart(productToAdd);
      navigate('/cart');
    }
  };

  // Image zoom handlers
  const handleImageMouseMove = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const handleImageMouseEnter = () => {
    setIsImageZoomed(true);
  };

  const handleImageMouseLeave = () => {
    setIsImageZoomed(false);
  };
  
  // Function to convert various video URLs to embeddable formats
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract YouTube video ID
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
      }
      
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    
    // Return original URL if it's already an embed URL or unknown format
    return url;
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product details: ${response.status}`);
        }

        const data = await response.json();
        let productData = null;
        
        if (data.data && data.data.product) {
          productData = data.data.product;
        } else if (data.product) {
          productData = data.product;
        } else if (data.data) {
          productData = data.data;
        }
        
        if (!productData) {
          throw new Error('Product not found in API response');
        }
        
        // Create an array of all available images
        let allImages = [];
        
        // Add main image if available
        if (productData.image_url) {
          allImages.push(productData.image_url);
        }
        
        // Add gallery images if available
        if (productData.gallery_images) {
          // Handle different formats of gallery_images
          if (typeof productData.gallery_images === 'string') {
            // Handle comma-separated string format
            const galleryArray = productData.gallery_images.split(',').map(url => url.trim());
            allImages = [...allImages, ...galleryArray];
          } else if (Array.isArray(productData.gallery_images)) {
            // Handle array format - each item could be a string URL or an object with a url property
            const processedImages = productData.gallery_images.map(item => {
              // If item is an object with a url property, use that
              if (item && typeof item === 'object' && item.url) {
                return item.url;
              }
              // If item is just a string URL, use as is
              return item;
            });
            allImages = [...allImages, ...processedImages];
          }
        }
        
        // If no images are available, use a placeholder
        if (allImages.length === 0) {
          allImages = ['/placeholder-product.jpg'];
        }
        
        // Remove duplicate images and filter out any null, undefined, or invalid URLs
        allImages = [...new Set(allImages)]
          .filter(url => url && typeof url === 'string' && url.trim() !== '')
          .map(url => url.trim());
        
        console.log('Product media:', {
          images: allImages,
          videoUrl: productData.video_url
        });
        
        // Ensure all necessary fields have default values
        setProduct({
          ...productData,
          images: allImages,
          video_url: productData.video_url || null,
          quantity: parseInt(productData.quantity || 0),
          in_stock: productData.quantity > 0,
          stock_status: parseInt(productData.quantity || 0) > 5 
            ? 'In Stock' 
            : parseInt(productData.quantity || 0) > 0 
              ? 'Low Stock' 
              : 'Out of Stock',
          sku: productData.sku || `PM-${productData.product_id}`,
          price: parseFloat(productData.price || 0),
          regular_price: parseFloat(productData.regular_price || productData.price || 0),
          rating: parseFloat(productData.rating || 0),
          review_count: parseInt(productData.review_count || 0)
        });
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [productId]);

  // Toggle between image and video display
  const toggleMediaType = () => {
    setShowVideo(!showVideo);
    // Reset selected image when switching back to images
    if (showVideo) {
      setSelectedImage(0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8f6f3]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9bc948]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/shop" 
            className="bg-[#9bc948] text-white px-6 py-2 rounded-md hover:bg-[#8ab938] transition duration-300"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Available</h2>
          <p className="text-gray-600 mb-6">The requested product could not be found.</p>
          <Link 
            to="/shop" 
            className="bg-[#9bc948] text-white px-6 py-2 rounded-md hover:bg-[#8ab938] transition duration-300"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f6f3] min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Shop', path: '/shop' },
              { label: product?.category_name || 'Category', path: `/shop?category=${product?.category_id}` },
              { label: product?.name || 'Product', path: '#' }
            ]}
          />
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Product Media Gallery - Left Column */}
          <div className="flex flex-col">
            {/* Media Display */}
            <div 
              className="relative bg-white rounded-lg overflow-hidden shadow-md mb-4"
              style={{ height: '500px' }}
            >
              {/* Show Video or Image */}
              {showVideo && product.video_url ? (
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    src={getEmbedUrl(product.video_url)}
                    title={`${product.name} video`}
                    className="w-full h-full"
                    allowFullScreen
                    frameBorder="0"
                  ></iframe>
                </div>
              ) : (
                <div
                  ref={imageRef}
                  className="w-full h-full relative cursor-zoom-in"
                  onMouseMove={handleImageMouseMove}
                  onMouseEnter={handleImageMouseEnter}
                  onMouseLeave={handleImageMouseLeave}
                >
                  <img
                    src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="object-contain w-full h-full p-4"
                  />
                  
                  {isImageZoomed && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url(${product.images?.[selectedImage]})`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundSize: '200%',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 10
                      }}
                    />
                  )}
                </div>
              )}
              
              {/* Badges */}
              {calculateDiscount() > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {calculateDiscount()}% OFF
                </div>
              )}

              <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded ${
                product.stock_status === 'In Stock' ? 'bg-green-500 text-white' : 
                product.stock_status === 'Low Stock' ? 'bg-yellow-500 text-white' : 
                'bg-red-500 text-white'
              }`}>
                {product.stock_status}
              </div>
              
              {product.eco_friendly && (
                <div className="absolute bottom-4 left-4 bg-[#9bc948] text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Eco-Friendly
                </div>
              )}
            </div>
            
            {/* Media Thumbnail Gallery */}
            <div className="thumbnail-gallery">
              {/* Image Thumbnails */}
              {product.images && product.images.length > 0 && product.images.map((image, index) => (
                <div 
                  key={`img-${index}`}
                  className={`w-24 h-24 rounded cursor-pointer transition-all duration-200 thumbnail-item ${
                    !showVideo && selectedImage === index ? 'border-2 border-[#9bc948]' : 'border border-gray-200'
                  }`}
                  onClick={() => {
                    setShowVideo(false);
                    setSelectedImage(index);
                  }}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - ${index + 1}`} 
                    className="p-1"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ))}
              
              {/* Video Thumbnail (if available) */}
              {product.video_url && (
                <div 
                  className={`w-24 h-24 rounded cursor-pointer transition-all duration-200 thumbnail-item video-thumbnail ${
                    showVideo ? 'border-2 border-[#9bc948]' : 'border border-gray-200'
                  }`}
                  onClick={() => setShowVideo(true)}
                >
                  <div className="w-full h-full bg-gray-100 p-1 rounded relative">
                    <img 
                      src={product.images?.[0] || '/placeholder-product.jpg'} 
                      alt={`${product.name} - video`}
                      className="w-full h-full object-cover rounded opacity-75"
                    />
                    <div className="video-thumbnail-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                    <span className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white text-xs text-center py-0.5">Video</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details - Right Column */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="mb-1">
              <Link 
                to={`/shop?category=${product.category_id}`}
                className="text-[#9bc948] hover:text-[#8ab938] transition duration-200 text-sm font-medium"
              >
                {product.category_name}
              </Link>
            </div>
            
            {/* Product Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            {/* Ratings */}
            <div className="flex items-center mb-4">
              {renderStarRating(product.rating)}
              <span className="ml-2 text-gray-500 text-sm">
                {product.review_count 
                  ? `(${product.review_count} ${product.review_count === 1 ? 'review' : 'reviews'})`
                  : '(No reviews yet)'
                }
              </span>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              {product.regular_price > product.price ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-800">
                    ₹{formatPrice(product.price)}
                  </span>
                  <span className="ml-3 text-xl text-gray-500 line-through">
                    ₹{formatPrice(product.regular_price)}
                  </span>
                  <span className="ml-3 bg-red-100 text-red-700 text-sm font-semibold px-2 py-0.5 rounded">
                    Save {calculateDiscount()}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-800">
                  ₹{formatPrice(product.price)}
                </span>
              )}
            </div>
            
            {/* Short Description */}
            {product.short_description && (
              <div className="mb-6 text-gray-600">
                <p>{product.short_description}</p>
              </div>
            )}
            
            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-6"></div>
            
            {/* Stock Status */}
            <div className="mb-6 flex items-center">
              <span className={`font-medium ${
                product.stock_status === 'In Stock' ? 'text-green-600' : 
                product.stock_status === 'Low Stock' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {product.stock_status}
              </span>
              {product.stock_status !== 'Out of Stock' && (
                <span className="ml-2 text-gray-500">
                  ({product.quantity - cartQuantity} available)
                </span>
              )}
            </div>
            
            {/* Add to Cart Section */}
            {product.stock_status !== 'Out of Stock' ? (
              <div className="mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">
                    Quantity:
                  </label>
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className={`px-3 py-1 ${
                        quantity <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-12 text-center border-x border-gray-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.quantity}
                      className={`px-3 py-1 ${
                        quantity >= product.quantity ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    className={`flex items-center justify-center px-6 py-3 text-white font-medium rounded-md transition duration-300 ${
                      isInCart
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-[#9bc948] hover:bg-[#8ab938]'
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove from Cart
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={handleBuyNow}
                    className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-md">
                This product is currently out of stock. Please check back later.
              </div>
            )}
            
            {/* Product Info */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Product Details</h3>
              <ul className="space-y-2">
                {product.sku && (
                  <li className="flex">
                    <span className="w-1/3 text-gray-500">SKU:</span>
                    <span className="w-2/3 text-gray-800">{product.sku}</span>
                  </li>
                )}
                {product.brand && (
                  <li className="flex">
                    <span className="w-1/3 text-gray-500">Brand:</span>
                    <span className="w-2/3 text-gray-800">{product.brand}</span>
                  </li>
                )}
                {product.category_name && (
                  <li className="flex">
                    <span className="w-1/3 text-gray-500">Category:</span>
                    <span className="w-2/3 text-gray-800">{product.category_name}</span>
                  </li>
                )}
                {product.shipping_time && (
                  <li className="flex">
                    <span className="w-1/3 text-gray-500">Shipping:</span>
                    <span className="w-2/3 text-gray-800">
                      {product.free_shipping ? 'Free shipping' : 'Standard shipping'} - {product.shipping_time}
                    </span>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Eco-Friendly */}
            {product.eco_friendly && (
              <div className="mb-6 bg-[#f0f5e5] p-4 rounded-lg flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9bc948] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-[#6a8c32] mb-1">Eco-Friendly Product</h3>
                  <p className="text-gray-700 text-sm">
                    {product.eco_friendly_details || "This product is sustainably sourced and uses eco-friendly packaging, minimizing environmental impact."}
                  </p>
                </div>
              </div>
            )}
            
            {/* Secure Checkout */}
            <div className="mb-4 flex items-center text-gray-600 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="mt-12 mb-16">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex -mb-px space-x-8 overflow-x-auto pb-1">
              <button
                className={`py-4 font-medium text-center border-b-2 focus:outline-none whitespace-nowrap ${
                  activeTab === 'description'
                    ? 'border-[#9bc948] text-[#9bc948]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`py-4 font-medium text-center border-b-2 focus:outline-none whitespace-nowrap ${
                  activeTab === 'additional'
                    ? 'border-[#9bc948] text-[#9bc948]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('additional')}
              >
                Additional Information
              </button>
              <button
                className={`py-4 font-medium text-center border-b-2 focus:outline-none whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-[#9bc948] text-[#9bc948]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews {product.review_count > 0 && `(${product.review_count})`}
              </button>
              <button
                className={`py-4 font-medium text-center border-b-2 focus:outline-none whitespace-nowrap ${
                  activeTab === 'shipping'
                    ? 'border-[#9bc948] text-[#9bc948]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Description</h2>
                <div className="leading-relaxed">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p>No detailed description available for this product.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Additional Information Tab */}
            {activeTab === 'additional' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Information</h2>
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">SKU</th>
                        <td className="py-3 px-4 text-gray-800">{product.sku || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">Brand</th>
                        <td className="py-3 px-4 text-gray-800">{product.brand || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">Category</th>
                        <td className="py-3 px-4 text-gray-800">{product.category_name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">Free Shipping</th>
                        <td className="py-3 px-4 text-gray-800">{product.free_shipping ? 'Yes' : 'No'}</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">Shipping Time</th>
                        <td className="py-3 px-4 text-gray-800">{product.shipping_time || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">Eco-Friendly</th>
                        <td className="py-3 px-4 text-gray-800">{product.eco_friendly ? 'Yes' : 'No'}</td>
                      </tr>
                      {product.warranty_period && (
                        <tr>
                          <th className="py-3 px-4 text-left text-gray-500 w-1/3 bg-gray-50">Warranty</th>
                          <td className="py-3 px-4 text-gray-800">{product.warranty_period} days</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
                
                {/* Rating Summary */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="w-full md:w-1/3">
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
                      <div className="text-5xl font-bold text-gray-800 mb-2">
                        {product.rating ? product.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex mb-2">
                        {renderStarRating(product.rating || 0)}
                      </div>
                      <div className="text-gray-500 text-sm">
                        Based on {product.review_count || 0} {product.review_count === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    {/* Rating Bars */}
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center">
                          <div className="w-12 text-gray-600 text-sm flex-shrink-0">{star} star</div>
                          <div className="flex-grow bg-gray-200 h-2.5 rounded-full mx-3 overflow-hidden">
                            <div 
                              className="bg-yellow-400 h-full rounded-full" 
                              style={{ width: `${product.review_count ? (5 / product.review_count) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="w-8 text-right text-gray-600 text-sm flex-shrink-0">
                            {/* Placeholder for actual count */}
                            {Math.floor(product.review_count ? product.review_count / 5 : 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Write a Review */}
                    <div className="mt-6">
                      <Link
                        to={`/product/${product.product_id}/review`}
                        className="inline-flex items-center px-4 py-2 border border-[#9bc948] text-[#9bc948] bg-white rounded-md hover:bg-[#f0f5e5] transition duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Write a Review
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Review List */}
                {product.review_count > 0 ? (
                  <div className="space-y-6">
                    {/* Placeholder review - would be replaced with actual data */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                              JD
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">John Doe</div>
                            <div className="text-gray-500 text-sm">June 1, 2025</div>
                          </div>
                        </div>
                        <div>
                          {renderStarRating(5)}
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-800 mb-2">Great product!</h3>
                      <p className="text-gray-600">
                        This is a sample review. The actual review content would be displayed here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            )}
            
            {/* Shipping & Returns Tab */}
            {activeTab === 'shipping' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping & Returns</h2>
                
                <div className="space-y-6 text-gray-600">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Information</h3>
                    <p>
                      {product.free_shipping 
                        ? 'This product qualifies for free shipping.' 
                        : 'Standard shipping rates apply to this product.'
                      }
                    </p>
                    <p className="mt-2">
                      Estimated delivery time: {product.shipping_time || '3-5 business days'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Return Policy</h3>
                    <p>
                      We accept returns within 30 days of delivery for most items. Please ensure that the product is unused, in its original packaging, and in the same condition that you received it.
                    </p>
                  </div>
                  
                  {product.warranty_period && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Warranty</h3>
                      <p>
                        This product includes a {product.warranty_period}-day warranty against manufacturer defects.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 