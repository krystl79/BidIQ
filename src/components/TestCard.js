import React from 'react';

const TestCard = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 border-2 border-blue-500">
      <div className="shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full"></div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Test Card</div>
        <p className="text-gray-500">Verifying Tailwind CSS</p>
      </div>
    </div>
  );
};

export default TestCard; 