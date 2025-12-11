import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">Loading content...</p>
      </div>
    </div>
  );
};

export default Loading;