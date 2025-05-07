import React from 'react';

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
    <div className="flex flex-col mb-8 md:flex-row md:gap-8">
      <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg mb-6 md:mb-0 md:flex-1">
        <div className="text-5xl font-bold text-slate-800 leading-none mb-2">
          {avgRating.toFixed(1)}
        </div>
        <div className="flex mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xl mx-0.5 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-2">
        {[
          { stars: 5, count: five_star },
          { stars: 4, count: four_star },
          { stars: 3, count: three_star },
          { stars: 2, count: two_star },
          { stars: 1, count: one_star }
        ].map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-3">
            <div className="w-[60px] text-sm text-gray-500 text-right">
              {stars} star
            </div>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(count)}%` }}
              ></div>
            </div>
            <div className="w-[30px] text-sm text-gray-500 text-left">
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary; 