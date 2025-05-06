/**
 * API configuration file
 * 
 * This file contains the base URL for API requests based on the current environment.
 * Update these values when deploying to different environments.
 */

// Get API URL from environment or use default
const API_PORT = import.meta.env.VITE_API_PORT || 5000;
// Development environment (local)
const DEV_API_URL = `http://localhost:${API_PORT}/api`;

// Production environment
const PROD_API_URL = '/api'; // Use relative path in production

// Staging environment
const STAGING_API_URL = 'https://staging-api.example.com/api';

// Determine current environment
// In a real app, this would be set by the build system
const ENV = import.meta.env.MODE || 'development';

// Set base API URL based on environment
let BASE_API_URL;
switch (ENV) {
  case 'production':
    BASE_API_URL = PROD_API_URL;
    break;
  case 'staging':
    BASE_API_URL = STAGING_API_URL;
    break;
  default:
    BASE_API_URL = DEV_API_URL;
}

// Debug the base URL being used
console.log('API Base URL:', BASE_API_URL);

// Export API URL configurations
export const API_URL = BASE_API_URL;

// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  const url = `${BASE_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  // Debug generated URLs
  console.log(`Created API URL for ${endpoint}: ${url}`);
  return url;
};

// Auth-specific endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: createApiUrl('/auth/login'),
  REGISTER: createApiUrl('/auth/signup'),
  PROFILE: createApiUrl('/auth/me'),
  PHONE_VERIFY: createApiUrl('/auth/phone/verify'),
};

// Other API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: createApiUrl('/products'),
  CATEGORIES: createApiUrl('/categories'),
  CART: createApiUrl('/cart'),
  ORDERS: createApiUrl('/orders'),
  BLOGS: createApiUrl('/blogs'),
  CONTACT: createApiUrl('/contact'),
  REVIEWS: createApiUrl('/reviews'),
};

export default {
  API_URL,
  createApiUrl,
  AUTH_ENDPOINTS,
  API_ENDPOINTS,
}; 