/**
 * API Utilities for checking backend connectivity and troubleshooting API issues
 */

import { API_URL } from '../config/api';

/**
 * Checks if the backend server is reachable
 * @returns {Promise<boolean>} True if the backend is available, false otherwise
 */
export const checkBackendConnection = async () => {
  try {
    // Try to hit the health check endpoint
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Set a timeout to avoid long wait times if the server is down
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log('Backend connection successful!');
      return true;
    }
    
    console.warn('Backend responded with status:', response.status);
    return false;
  } catch (error) {
    console.error('Backend connection failed:', error.message);
    return false;
  }
};

/**
 * Performs a test API call and logs detailed information for debugging
 * @param {string} url - The API endpoint to test
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} [body] - Optional body for POST/PUT requests
 * @param {Object} [headers] - Optional additional headers
 * @returns {Promise<Object>} The result of the test with detailed diagnostics
 */
export const testApiCall = async (url, method = 'GET', body = null, headers = {}) => {
  console.log(`Testing API call to: ${url}`);
  console.log(`Method: ${method}`);
  
  if (body) {
    console.log('Request body:', body);
  }
  
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  const mergedHeaders = { ...defaultHeaders, ...headers };
  console.log('Request headers:', mergedHeaders);
  
  try {
    const options = {
      method,
      headers: mergedHeaders,
      signal: AbortSignal.timeout(10000)
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();
    
    console.log(`API response time: ${endTime - startTime}ms`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response data:', data);
        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data,
          responseTime: endTime - startTime
        };
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          text,
          responseTime: endTime - startTime
        };
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: 'Could not parse response',
        responseTime: endTime - startTime
      };
    }
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  checkBackendConnection,
  testApiCall
}; 