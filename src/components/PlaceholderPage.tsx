
import React from 'react';
import DefaultLayout from './layouts/DefaultLayout';

interface PlaceholderPageProps {
  title: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title={title}
    >
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600">
          Bu sayfa henüz geliştirme aşamasındadır.
        </p>
      </div>
    </DefaultLayout>
  );
};

export default PlaceholderPage;
