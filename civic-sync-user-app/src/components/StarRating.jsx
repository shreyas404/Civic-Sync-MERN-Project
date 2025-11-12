import React, { useState } from 'react';
import './StarRating.css';

function StarRating({ rating = 0, onRate, disabled = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (index) => {
    if (disabled) return;
    onRate(index);
  };

  const handleMouseEnter = (index) => {
    if (disabled) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverRating || rating);
        
        return (
          <svg
            key={starValue}
            className={`star ${isFilled ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

export default StarRating;