import React from 'react';
import './ReviewsList.css';

const ReviewsList = ({ reviews, loading, error }) => {
  // Helper function for user avatar/initials
  const getUserInitials = (name) => {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#9bc948]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 text-center">
        <div className="flex justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-700">{error}</p>
        <p className="text-gray-500 text-sm mt-2">Our team has been notified and is working on a fix.</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <div className="flex justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No Reviews Yet</h3>
        <p className="text-gray-500">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="reviews-list space-y-6">
      {reviews.map((review) => (
        <div key={review.review_id} className="review-item p-5 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-start">
            {/* User avatar/initials */}
            <div className="review-avatar">
              {review.avatar_url ? (
                <img 
                  src={review.avatar_url} 
                  alt={review.user_name || 'User'} 
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.target.onError = null;
                    e.target.innerHTML = getUserInitials(review.user_name);
                    e.target.className = "w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium";
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                  {getUserInitials(review.user_name)}
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{review.user_name || 'Anonymous User'}</h4>
                  <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                </div>
                
                {/* Rating stars */}
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Review content */}
              <div className="mt-3">
                {review.title && (
                  <h5 className="font-medium text-gray-800 mb-1">{review.title}</h5>
                )}
                <p className="text-gray-600">{review.content}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList; 