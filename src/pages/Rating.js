import React from 'react';
import { Star, StarFill, StarHalf } from 'react-bootstrap-icons';

const Rating = ({ value = 0, text, color = 'currentColor' }) => {
  const rating = Number(value) || 0;

  return (
    <span className="rating" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="rating-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((index) => {
          const Icon = rating >= index ? StarFill : rating >= index - 0.5 ? StarHalf : Star;
          return <Icon key={index} style={{ color }} />;
        })}
      </span>
      {text && <span className="rating-text">{text}</span>}
    </span>
  );
};

export default Rating;