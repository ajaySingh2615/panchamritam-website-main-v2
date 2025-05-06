import React, { useState, useEffect, useRef } from 'react';

const PriceRangeSlider = ({ minPrice = 0, maxPrice = 10000, initialMin = 0, initialMax = 10000, onPriceChange }) => {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);
  const sliderRef = useRef(null);

  // Initialize with the props values when they change
  useEffect(() => {
    setMin(initialMin);
    setMax(initialMax);
  }, [initialMin, initialMax]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingMin && !isDraggingMax) return;
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const sliderWidth = rect.width;
      const offsetX = e.clientX - rect.left;
      
      // Calculate percentage of slider width
      const percentage = Math.max(0, Math.min(100, (offsetX / sliderWidth) * 100));
      
      // Calculate value based on min and max price
      const value = Math.round(((percentage / 100) * (maxPrice - minPrice)) + minPrice);
      
      if (isDraggingMin) {
        // Ensure min doesn't exceed max
        setMin(Math.min(value, max - 100));
      } else if (isDraggingMax) {
        // Ensure max doesn't fall below min
        setMax(Math.max(value, min + 100));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingMin || isDraggingMax) {
        // Only call the callback when we stop dragging
        if (onPriceChange) {
          onPriceChange([min, max]);
        }
      }
      
      setIsDraggingMin(false);
      setIsDraggingMax(false);
    };

    // Add touch events for mobile devices
    const handleTouchMove = (e) => {
      if (!isDraggingMin && !isDraggingMax) return;
      if (!sliderRef.current || !e.touches[0]) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const sliderWidth = rect.width;
      const offsetX = e.touches[0].clientX - rect.left;
      
      // Calculate percentage of slider width
      const percentage = Math.max(0, Math.min(100, (offsetX / sliderWidth) * 100));
      
      // Calculate value based on min and max price
      const value = Math.round(((percentage / 100) * (maxPrice - minPrice)) + minPrice);
      
      if (isDraggingMin) {
        // Ensure min doesn't exceed max
        setMin(Math.min(value, max - 100));
      } else if (isDraggingMax) {
        // Ensure max doesn't fall below min
        setMax(Math.max(value, min + 100));
      }
    };

    const handleTouchEnd = () => {
      if (isDraggingMin || isDraggingMax) {
        // Only call the callback when we stop dragging
        if (onPriceChange) {
          onPriceChange([min, max]);
        }
      }
      
      setIsDraggingMin(false);
      setIsDraggingMax(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingMin, isDraggingMax, min, max, minPrice, maxPrice, onPriceChange]);

  // Handle direct input of values
  const handleMinInputChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    const newMin = Math.max(minPrice, Math.min(value, max - 100));
    setMin(newMin);
    onPriceChange([newMin, max]);
  };

  const handleMaxInputChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    const newMax = Math.min(maxPrice, Math.max(value, min + 100));
    setMax(newMax);
    onPriceChange([min, newMax]);
  };

  // Calculate thumb positions as percentages
  const minThumbPosition = ((min - minPrice) / (maxPrice - minPrice)) * 100;
  const maxThumbPosition = ((max - minPrice) / (maxPrice - minPrice)) * 100;

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-full mb-4 text-left pl-0 ml-0">
      <div 
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full my-5 ml-0 pl-0"
      >
        {/* Active Range Track */}
        <div
          className="absolute h-2 bg-[#9bc948] rounded-full"
          style={{
            left: `${minThumbPosition}%`,
            width: `${maxThumbPosition - minThumbPosition}%`
          }}
        ></div>
        
        {/* Min Thumb */}
        <div
          className={`absolute w-5 h-5 bg-[#9bc948] rounded-full shadow-md -mt-1.5 transform -translate-x-1/2 cursor-pointer flex items-center justify-center ${isDraggingMin ? 'ring-2 ring-green-300' : ''}`}
          style={{ left: `${minThumbPosition}%` }}
          onMouseDown={() => setIsDraggingMin(true)}
          onTouchStart={() => setIsDraggingMin(true)}
          role="slider"
          aria-valuemin={minPrice}
          aria-valuemax={max}
          aria-valuenow={min}
          tabIndex={0}
        ></div>
        
        {/* Max Thumb */}
        <div
          className={`absolute w-5 h-5 bg-[#9bc948] rounded-full shadow-md -mt-1.5 transform -translate-x-1/2 cursor-pointer flex items-center justify-center ${isDraggingMax ? 'ring-2 ring-green-300' : ''}`}
          style={{ left: `${maxThumbPosition}%` }}
          onMouseDown={() => setIsDraggingMax(true)}
          onTouchStart={() => setIsDraggingMax(true)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={maxPrice}
          aria-valuenow={max}
          tabIndex={0}
        ></div>
      </div>
      
      <div className="flex gap-3 ml-0 pl-0">
        <div className="ml-0 pl-0 pr-2 w-1/2">
          <input
            type="number"
            value={min}
            onChange={handleMinInputChange}
            min={minPrice}
            max={max - 100}
            step="100"
            className="w-full border border-gray-300 rounded py-2 px-2 text-left bg-white text-sm"
            placeholder="Min Price"
          />
        </div>
        <div className="pl-0 w-1/2">
          <input
            type="number"
            value={max}
            onChange={handleMaxInputChange}
            min={min + 100}
            max={maxPrice}
            step="100"
            className="w-full border border-gray-300 rounded py-2 px-2 text-left bg-white text-sm"
            placeholder="Max Price"
          />
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider; 