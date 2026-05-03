import React from 'react';

export const Skeleton = ({ className }) => {
  return (
    <div 
      className={`animate-pulse bg-slate-200 rounded-md ${className}`} 
    />
  );
};

export const SkeletonCircle = ({ className }) => {
  return (
    <div 
      className={`animate-pulse bg-slate-200 rounded-full ${className}`} 
    />
  );
};
