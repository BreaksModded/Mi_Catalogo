import React from 'react';
import '../styles/skeletons.css';

const PosterSkeleton = ({ size = 'normal', className = '' }) => {
  const sizeClass = size === 'small' ? 'poster-skeleton-small' : 
                   size === 'large' ? 'poster-skeleton-large' : '';
  
  return (
    <div 
      className={`poster-skeleton ${sizeClass} ${className}`}
      aria-label="Cargando portada..."
    />
  );
};

export default PosterSkeleton;
