import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { API_ENDPOINTS } from '../config/api';
import PriceRangeSlider from '../components/shop/PriceRangeSlider';
import CategoryFilter from '../components/shop/CategoryFilter';
import ProductCard from '../components/shop/ProductCard';
import Breadcrumb from '../components/common/Breadcrumb';

// Custom dropdown component
const CustomDropdown = ({ options, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };
  
  const selectedOption = options.find(option => option.value === value) || options[0];
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full text-sm text-gray-600 bg-[#f8f6f3] appearance-none focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.label}</span>
        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded text-sm">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                className={`px-3 py-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchDebounceTimerRef = useRef(null);
  const [productsPerPage, setProductsPerPage] = useState(9);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Parse URL search params
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const pageParam = searchParams.get('page');
  const queryParam = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  
  useEffect(() => {
    // Set initial values from URL params
    if (minPriceParam && maxPriceParam) {
      setPriceRange([
        parseInt(minPriceParam || 0, 10),
        parseInt(maxPriceParam || 10000, 10)
      ]);
    } else {
      // Set default price range if not in URL
      setPriceRange([0, 10000]);
    }
    
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }

    if (queryParam) {
      setSearchQuery(queryParam);
      setDebouncedSearchQuery(queryParam);
    }
    
    if (limitParam) {
      setProductsPerPage(parseInt(limitParam, 10));
    }
    
    // Fetch categories
    fetchCategories();
    
    // Fetch products
    fetchProducts();
  }, [location.search]);
  
  // Debounce search query updates
  useEffect(() => {
    // Clear any existing timer
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    
    // Set a new timer
    searchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      
      // Update URL with search query, but only if it's not empty
      // and different from the current query parameter
      if (searchQuery !== queryParam) {
        const params = new URLSearchParams(location.search);
        
        if (searchQuery.trim()) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
        
        // Reset to page 1 when searching
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      }
    }, 500); // 500ms debounce delay
    
    // Cleanup function to clear timer if component unmounts or searchQuery changes
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, [searchQuery]);
  
    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        
        if (!response.ok) {
        throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        if (data.data && data.data.categories) {
          setCategories(data.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams(location.search);
      
      if (!params.has('page')) {
        params.set('page', currentPage.toString());
      }
      
      if (params.get('limit') === 'all') {
        params.delete('limit');
      } else if (!params.has('limit')) {
        params.set('limit', productsPerPage.toString());
      }
      
      const requestUrl = `${API_ENDPOINTS.PRODUCTS}?${params.toString()}`;
      console.log('Fetching products from:', requestUrl);
      
      // If we're checking page 1, also check the total count
      if (params.get('page') === '1' || !params.has('page')) {
        try {
          // Create a URL for getting all products (to count them)
          const countParams = new URLSearchParams();
          if (params.has('category')) countParams.set('category', params.get('category'));
          if (params.has('minPrice')) countParams.set('minPrice', params.get('minPrice'));
          if (params.has('maxPrice')) countParams.set('maxPrice', params.get('maxPrice'));
          if (params.has('q')) countParams.set('q', params.get('q'));
          
          const countUrl = `${API_ENDPOINTS.PRODUCTS}?${countParams.toString()}`;
          const countResponse = await fetch(countUrl);
          
          if (countResponse.ok) {
            const countData = await countResponse.json();
            if (countData.data && countData.data.products) {
              const actualCount = countData.data.products.length;
              setTotalProducts(actualCount);
              console.log('Actual total product count:', actualCount);
              
              // Calculate pages based on actual count
              const currentLimit = parseInt(params.get('limit') || productsPerPage);
              const actualPages = Math.ceil(actualCount / currentLimit);
              setTotalPages(actualPages);
              console.log('Total pages based on actual count:', actualPages);
            }
          }
        } catch (countErr) {
          console.error('Error getting total count:', countErr);
        }
      }
      
      // Continue with the paginated request
      const response = await fetch(requestUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Products API response:', data);
      
      if (data.data) {
        const productsList = data.data.products || [];
        setProducts(productsList);
        console.log('Products set:', productsList.length, 'products');
        
        // Handle pagination information
        const pagination = data.pagination || data.data.pagination;
        const hasMore = pagination?.hasMore || false;
        
        // Use the hasMore flag to ensure we have proper pagination
        if (hasMore && totalPages <= currentPage) {
          setTotalPages(currentPage + 1);
          console.log('Adjusting to at least', currentPage + 1, 'pages because hasMore is true');
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryFilter = (categoryId) => {
    const params = new URLSearchParams(location.search);
    
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    
    params.set('page', '1');
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  const handlePriceChange = (range) => {
    setPriceRange(range);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('minPrice', range[0].toString());
    params.set('maxPrice', range[1].toString());
    params.set('page', '1'); // Reset to page 1 when filters change
    
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Handle search input change - now this immediately updates state for live search
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    const params = new URLSearchParams(location.search);
    params.delete('q');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Search form submission - now optional since we have live search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Force immediate update without waiting for debounce
    setDebouncedSearchQuery(searchQuery);
    
    const params = new URLSearchParams(location.search);
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    params.set('page', '1');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Search function to filter products by query
  const searchProducts = (products, query) => {
    if (!query || !query.trim()) return products;
    
    const searchTerms = query.toLowerCase().trim().split(' ').filter(term => term.length > 0);
    
    return products.filter(product => {
      // Search in different product fields
      const searchableText = [
        product.name || '',
        product.description || '',
        product.category_name || '',
        product.brand || ''
      ].join(' ').toLowerCase();
      
      // Check if ALL search terms exist in the product's searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  };

  // Apply price filter to products
  const applyPriceFilter = (products) => {
    if (!priceRange || priceRange.length !== 2) return products;
    
    const [minPrice, maxPrice] = priceRange;
    
    return products.filter(product => {
      const price = parseFloat(product.price || 0);
      return price >= minPrice && price <= maxPrice;
    });
  };
  
  // Sort products based on selected option
  const getSortedProducts = () => {
    if (!products || products.length === 0) return [];

    const productsCopy = [...products];

    switch (sortOption) {
      case 'price-low':
        return productsCopy.sort((a, b) => 
          parseFloat(a.price || 0) - parseFloat(b.price || 0)
        );
      case 'price-high':
        return productsCopy.sort((a, b) => 
          parseFloat(b.price || 0) - parseFloat(a.price || 0)
        );
      case 'name-asc':
        return productsCopy.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
      case 'name-desc':
        return productsCopy.sort((a, b) => 
          (b.name || '').localeCompare(a.name || '')
        );
      case 'default':
      default:
        // Default sorting - you can define what this means for your shop
        // Often it's by newest or featured products
        return productsCopy;
    }
  };

  // Apply all filters in the correct order
  const sortedProducts = getSortedProducts();
  const priceFilteredProducts = applyPriceFilter(sortedProducts);
  const filteredProducts = debouncedSearchQuery 
    ? searchProducts(priceFilteredProducts, debouncedSearchQuery)
    : priceFilteredProducts;
  
  const handlePageChange = (page) => {
    if (page === currentPage) return; // Don't reload if already on this page
    
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    
    // Update URL and trigger page reload
    const newUrl = `${location.pathname}?${params.toString()}`;
    navigate(newUrl);
    
    // Force state update
    setCurrentPage(page);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleProductsPerPageChange = (limit) => {
    const params = new URLSearchParams(location.search);
    
    if (limit === 'all') {
      params.set('limit', 'all');
    } else {
      params.set('limit', limit.toString());
      setProductsPerPage(parseInt(limit, 10));
    }
    
    params.set('page', '1');
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1
    });
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const formatPrice = (price) => {
    return price.toFixed(2);
  };
  
  // Generate star ratings
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fillOpacity="0.5"></path>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
          </svg>
        );
      }
    }
    
    return stars;
  };
  
  const sortOptions = [
    { value: 'default', label: 'Default sorting' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
  ];
  
  const handleSortChange = (value) => {
    setSortOption(value);

    // Update URL with sort parameter
    const params = new URLSearchParams(location.search);
    params.set('sort', value);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Add a new function to handle reset all filters
  const handleResetFilters = () => {
    // Clear search query
    setSearchQuery('');
    setDebouncedSearchQuery('');
    
    // Reset price range to default
    setPriceRange([0, 10000]);
    
    // Reset sort option
    setSortOption('default');
    
    // Reset to page 1
    setCurrentPage(1);
    
    // Clear all URL parameters and navigate to clean shop URL
    navigate('/shop');
  };

  return (
    <div className="bg-[#f8f6f3] min-h-screen pb-0">
      <div className="container mx-auto px-4 pt-16 pb-8 sm:pt-16 md:pt-12 lg:pt-8">
        {/* Page Header */}
        <div className="pt-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              {products.length > 0 ? `${totalProducts} products found` : 'No products found'}
            </p>
            <button 
              onClick={toggleFilters}
              className="lg:hidden bg-[#9bc948] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#8ab938] transition duration-300 self-start"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'} 
        </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
          {/* Sidebar Filters */}
          <div className={`w-full lg:w-1/4 ${showFilters ? 'block mb-8 lg:mb-0' : 'hidden lg:block'} lg:border-r lg:border-gray-300 lg:pr-6`}>
            {/* Search Box */}
            <div className="mb-6">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-[#9bc948]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#9bc948] text-white px-3 py-2 rounded-r hover:bg-[#8ab938] transition duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              </form>
              {debouncedSearchQuery && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">
                    {filteredProducts.length} results for "{debouncedSearchQuery}"
                  </span>
                  <button 
                    onClick={handleClearSearch} 
                    className="ml-2 text-[#9bc948] hover:text-[#8ab938] focus:outline-none"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-[#f8f6f3] rounded pl-0 pr-5 pt-5 pb-5 mb-2 text-left">
              <h2 className="text-[1.35rem] font-semibold text-gray-800 mb-4 no-underline border-0 border-none inline text-left ml-0 pl-0">Filter by price</h2>
              
              <div className="pl-0 ml-0 w-full">
                <PriceRangeSlider 
                  minPrice={0}
                  maxPrice={10000}
                  initialMin={priceRange[0]}
                  initialMax={priceRange[1]}
                  onPriceChange={handlePriceChange}
                />
            </div>
          </div>
          
            <CategoryFilter
              categories={categories}
              selectedCategory={categoryParam}
              onCategoryChange={handleCategoryFilter}
              totalProducts={totalProducts}
            />
          </div>
          
          {/* Products Grid */}
          <div className="w-full lg:w-3/4 lg:pl-8">
            {/* Move breadcrumb and Shop heading here */}
            {/* Breadcrumb at the top */}
            {categoryParam && categories.find(c => c.category_id == categoryParam) ? (
              <Breadcrumb
                items={[
                  { label: 'Home', path: '/' },
                  { label: categories.find(c => c.category_id == categoryParam).name, path: `/shop?category=${categoryParam}` }
                ]}
              />
            ) : (
              <Breadcrumb
                items={[
                  { label: 'Home', path: '/' },
                  { label: 'Shop', path: '/shop' }
                ]}
              />
            )}
            
            {/* Shop heading with adjusted spacing */}
            <h1 className="text-4xl sm:text-6xl font-bold text-[#9bc948] mt-2 mb-6">
              {categoryParam && categories.find(c => c.category_id == categoryParam)
                ? categories.find(c => c.category_id == categoryParam).name
                : 'Shop'
              }
            </h1>
            
            {/* Sorting Options */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="text-gray-600 mb-3 md:mb-0">
                {products.length > 0 ? (
                  <>
                    {limitParam === 'all' ? (
                      <>Showing all {totalProducts} products</>
                    ) : (
                      <>
                        Showing {Math.max(1, (currentPage - 1) * parseInt(limitParam || productsPerPage) + 1)}–
                        {Math.min(currentPage * parseInt(limitParam || productsPerPage), totalProducts)} of {totalProducts} results
                      </>
                    )}
                  </>
                ) : (
                  <>No products found</>
                )}
              </div>
              <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                <CustomDropdown
                  options={sortOptions}
                value={sortOption}
                onChange={handleSortChange}
                  className="w-40"
                />
                
                <div className="relative">
                  <select 
                    value={limitParam || productsPerPage}
                    onChange={(e) => handleProductsPerPageChange(e.target.value)}
                    className="appearance-none bg-[#f8f6f3] pl-3 pr-8 py-1.5 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#9bc948]"
                  >
                    <option value="9">Show 9</option>
                    <option value="12">Show 12</option>
                    <option value="24">Show 24</option>
                    <option value="all">Show all</option>
              </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-600">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
            </div>
          </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {debouncedSearchQuery ? 
                    `No results found for "${debouncedSearchQuery}". Try different keywords or` : 
                    "Try adjusting your filters or"
                  }
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="bg-[#9bc948] text-white px-4 py-2 rounded-md hover:bg-[#8ab938] transition duration-300"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.product_id}
                    product={product}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {limitParam !== 'all' && (
              <div className="mt-10 flex justify-start">
                <nav className="flex items-center space-x-2">
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1)
                    .map(page => (
              <button
                        key={page}
                      onClick={() => handlePageChange(page)}
                        className={`w-12 h-12 flex items-center justify-center text-lg font-medium transition-colors duration-150 ${
                          currentPage === page
                            ? 'bg-[#9bc948] text-white' 
                            : 'bg-white border border-[#9bc948] text-[#9bc948] hover:bg-gray-50'
                        }`}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                ))}
              
                  {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-white border border-[#9bc948] text-[#9bc948] hover:bg-gray-50 transition-colors duration-150"
                aria-label="Next page"
              >
                      →
              </button>
                  )}
                </nav>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop; 