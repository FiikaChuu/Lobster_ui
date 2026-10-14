import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  className = ''
}) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-inset) 25%, rgba(255, 255, 255, 0.08) 50%, var(--bg-inset) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.8s infinite'
      }}
    />
  );
};
