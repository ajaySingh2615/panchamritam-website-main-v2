import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, totalProducts }) => {
  return (
    <div className="bg-[#f8f6f3] rounded pl-0 pr-5 pt-5 pb-5 text-left">
      <ul className="space-y-0.5 pl-0 ml-0">
        <li className="pl-0 ml-0">
          <button 
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left py-1 px-2 rounded transition-colors duration-150 ${
              !selectedCategory 
                ? 'text-[#6a8c31] font-medium' 
                : 'text-gray-700 hover:text-[#9bc948]'
            }`}
          >
            {!selectedCategory ? (
              <>All Products ({totalProducts})</>
            ) : (
              <>All Products ({totalProducts})</>
            )}
          </button>
        </li>
        {categories.map(category => (
          <li key={category.category_id} className="pl-0 ml-0">
            <button 
              onClick={() => onCategoryChange(category.category_id)}
              className={`w-full text-left py-1 px-2 rounded transition-colors duration-150 ${
                selectedCategory == category.category_id 
                  ? 'text-[#6a8c31] font-medium' 
                  : ''
              }`}
            >
              {selectedCategory == category.category_id ? (
                <>{category.name} ({category.product_count || 0})</>
              ) : (
                <>
                  <span className="text-[#9bc948] hover:text-[#6a8c31]">{category.name}</span>
                  <span className="text-gray-800"> ({category.product_count || 0})</span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter; 