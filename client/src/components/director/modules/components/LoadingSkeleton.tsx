import React from 'react';

interface LoadingSkeletonProps {
  type?: 'chart' | 'table' | 'card';
  height?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'chart', height = 300 }) => {
  if (type === 'chart') {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-gray-500 flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span>Chargement du graphique...</span>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;