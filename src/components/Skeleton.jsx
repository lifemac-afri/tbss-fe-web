import React from 'react';

const Skeleton = ({ className = '', variant = 'rect' }) => {
  const base = 'animate-pulse bg-gray-200 rounded';
  const variants = {
    rect: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };
  return <div className={`${base} ${variants[variant] || variants.rect} ${className}`} aria-hidden="true" />;
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
    <Skeleton className="aspect-[3/4.2] w-full" />
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" />
    <div className="flex justify-between items-center pt-1">
      <Skeleton variant="text" className="w-16 h-6" />
      <Skeleton variant="circle" className="w-9 h-9" />
    </div>
  </div>
);

export default Skeleton;
