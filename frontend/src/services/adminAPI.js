import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with common config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const resetUserPassword = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// User related data
export const getUserOrders = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/addresses`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Categories
export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategory = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Products
export const getAllProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Upload single product image
export const uploadProductImage = async (productId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/products/${productId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Upload multiple gallery images
export const uploadGalleryImages = async (productId, imageFiles) => {
  try {
    const formData = new FormData();
    
    // Append each image to the form data
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await api.post(`/products/${productId}/upload-gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Save video URL
export const saveVideoUrl = async (productId, videoUrl) => {
  try {
    const response = await api.post(`/products/${productId}/save-video-url`, {
      video_url: videoUrl
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Roles
export const getAllRoles = async () => {
  try {
    const response = await api.get('/admin/roles');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Helper function to handle errors
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    return {
      message: data.message || 'An error occurred',
      status
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server',
      status: 503
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message,
      status: 500
    };
  }
}; 