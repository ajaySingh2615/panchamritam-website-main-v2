import React from 'react';
import './ReviewSummary.css';

const ReviewSummary = ({ stats, totalReviews }) => {
  const { 
    average_rating = 0,
    five_star = 0, 
    four_star = 0, 
    three_star = 0, 
    two_star = 0, 
    one_star = 0 
  } = stats || {};

  // Ensure average_rating is a number
  const avgRating = typeof average_rating === 'number' ? average_rating : parseFloat(average_rating) || 0;

  // Calculate percentages for each star rating
  const getPercentage = (count) => {
    if (!totalReviews || totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="review-summary">
      <div className="average-rating">
        <div className="rating-number">
          {avgRating.toFixed(1)}
        </div>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= Math.round(avgRating) ? 'filled' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="rating-count">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      <div className="rating-bars">
        {[
          { stars: 5, count: five_star },
          { stars: 4, count: four_star },
          { stars: 3, count: three_star },
          { stars: 2, count: two_star },
          { stars: 1, count: one_star }
        ].map(({ stars, count }) => (
          <div key={stars} className="rating-bar-container">
            <div className="rating-label">{stars} star</div>
            <div className="rating-bar-wrapper">
              <div
                className="rating-bar-fill"
                style={{ width: `${getPercentage(count)}%` }}
              ></div>
            </div>
            <div className="rating-count-small">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary; 