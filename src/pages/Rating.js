import React from 'react';

const Rating = ({ value, text, color = '#f8e825' }) => {
  return (
    <div className='rating'>
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index}>
          <i style={{ color }}
            className={
              value >= index
                ? 'fas fa-star' // Full Star
                : value >= index - 0.5
                ? 'fas fa-star-half-alt' // Half Star
                : 'far fa-star' // Empty Star
            }
          ></i>
        </span>
      ))}
      <span className="ms-2">{text && text}</span>
    </div>
  );
};

export default Rating;