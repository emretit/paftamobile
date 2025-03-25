
import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">NGS Platform</h1>
      <div className="flex gap-4">
        <Link 
          to="/auth" 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          Giriş Yap
        </Link>
        <Link 
          to="/proposals" 
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
        >
          Teklifler
        </Link>
      </div>
    </div>
  );
};

export default Index;
