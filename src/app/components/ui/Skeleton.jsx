import React from 'react';

export const Skeleton = ({ className }) => {
  return (
    <div className={`bg-surface-container-high animate-skeleton rounded-md ${className || ''}`} />
  );
};

export const SkeletonCircle = ({ className }) => {
  return (
    <div className={`bg-surface-container-high animate-skeleton rounded-full ${className || ''}`} />
  );
};
