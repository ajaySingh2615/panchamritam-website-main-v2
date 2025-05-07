import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const ReviewForm = ({ productId, onReviewSubmit, existingReview = null, onCancel }) => {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    title: existingReview?.title || '',
    content: existingReview?.content || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // At the component level
  const hasValidToken = !!localStorage.getItem('token');

  // Set up validation rules
  const validate = () => {
    const newErrors = {};
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars';
    }
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Please provide a title for your review';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  // Handle star rating click
  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated && !hasValidToken) {
      setStatus({
        type: 'error',
        message: 'You must be logged in to submit a review'
      });
      return;
    }
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setStatus({
          type: 'error',
          message: 'Authentication token not found. Please log in again.'
        });
        setLoading(false);
        return;
      }
      
      // Prepare headers with authentication
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Ensure rating is a number
      const reviewData = {
        ...formData,
        rating: parseFloat(formData.rating) || 5 // Default to 5 if parsing fails
      };
      
      console.log('Submitting review:', {
        productId,
        reviewData,
        token: token ? token.substring(0, 20) + '...' : null,
        user: user
      });
      
      let response;
      
      if (existingReview) {
        // Update existing review
        response = await axios.put(
          `${API_ENDPOINTS.REVIEWS}/${existingReview.review_id}`,
          reviewData,
          { headers }
        );
      } else {
        // Create new review - use axios with better error handling
        try {
          response = await axios.post(
            `${API_ENDPOINTS.REVIEWS}/product/${productId}`,
            reviewData,
            { 
              headers,
              timeout: 10000 // 10 second timeout
            }
          );
        } catch (requestError) {
          console.error('Review submission error details:', {
            message: requestError.message,
            status: requestError.response?.status,
            data: requestError.response?.data,
            config: {
              url: requestError.config?.url,
              method: requestError.config?.method,
              data: JSON.stringify(requestError.config?.data)
            },
            request: requestError.request ? 'Request object exists' : 'No request object'
          });
          throw requestError;
        }
      }
      
      if (response.data.status === 'success') {
        setStatus({
          type: 'success',
          message: existingReview 
            ? 'Your review has been updated successfully!' 
            : 'Thank you for your review!'
        });
        
        // Reset form if it's a new review
        if (!existingReview) {
          setFormData({
            rating: 5,
            title: '',
            content: ''
          });
        }
        
        // Notify parent component with the returned review or a constructed one
        if (onReviewSubmit) {
          const reviewToSubmit = response.data.data?.review || {
            ...reviewData,
            review_id: Math.floor(Math.random() * 1000000), // Temporary ID
            user_id: user?.user_id,
            user_name: user?.name,
            avatar_url: user?.profile_picture || null,
            created_at: new Date().toISOString()
          };
          
          console.log('Submitting review to parent:', reviewToSubmit);
          onReviewSubmit(reviewToSubmit);
        }
      } else {
        setStatus({
          type: 'error',
          message: 'Failed to submit review. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = 'Failed to submit review. Please try again later.';
      
      // Handle unauthorized error
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      }
      // Check for specific API error messages
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Render star rating element
  const renderStarRating = () => {
    return (
      <div className="flex mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-3xl cursor-pointer mr-1 transition-colors ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => handleStarClick(star)}
            role="button"
            tabIndex="0"
          >
            ★
          </span>
        ))}
        {errors.rating && <div className="text-red-600 text-sm mt-1">{errors.rating}</div>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      {status && (
        <div className={`p-3 rounded mb-4 text-sm ${
          status.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {status.message}
        </div>
      )}
      
      {(isAuthenticated || hasValidToken) ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block font-medium mb-2 text-gray-700">Your Rating*</label>
            {renderStarRating()}
          </div>
          
          <div className="mb-5">
            <label htmlFor="title" className="block font-medium mb-2 text-gray-700">Review Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your review a title"
              maxLength="100"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-[#9bc948] transition"
            />
            {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
          </div>
          
          <div className="mb-5">
            <label htmlFor="content" className="block font-medium mb-2 text-gray-700">Your Review</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your experience with this product"
              rows="5"
              maxLength="1000"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-[#9bc948] transition"
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel} 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="px-6 py-3 bg-[#9bc948] text-white rounded hover:bg-[#8ab938] transition disabled:bg-[#b3d475] disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded">
          Please <a href="/login" className="text-[#9bc948] font-medium hover:underline">sign in</a> to write a review.
        </div>
      )}
    </div>
  );
};

export default ReviewForm; 