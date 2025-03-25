
import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface ProductsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Products: React.FC<ProductsProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <PlaceholderPage 
      title="Ürünler" 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed} 
    />
  );
};

export default Products;
